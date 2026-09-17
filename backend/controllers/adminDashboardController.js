const Allocation = require("../models/Allocation");
const Expense = require("../models/Expense");
const { getMonthRange, getMonthKey, getMonthLabel } = require("../utils/month");

const getAdminDashboard = async (req, res) => {
    try {
        // Keep all records for history, but calculate the dashboard from the current month.
        const allocations = await Allocation.find()
            .populate("employee", "name employeeCode")
            .lean();

        const expenses = await Expense.find()
            .populate("employee", "name employeeCode")
            .populate("category", "name")
            .lean();

        const { start: monthStart, end: nextMonthStart } = getMonthRange();
        const currentAllocations = allocations.filter((item) => {
            const date = new Date(item.allocationDate || item.createdAt);
            return date >= monthStart && date < nextMonthStart;
        });
        const currentExpenses = expenses.filter((item) => {
            const date = new Date(item.expenseDate || item.createdAt);
            return date >= monthStart && date < nextMonthStart;
        });

        // --------------------------------
        // OVERALL TOTALS
        // --------------------------------

        const totalGiven = currentAllocations.reduce(
            (total, item) => total + item.amount,
            0
        );

        const totalSpent = currentExpenses.reduce(
            (total, item) => total + item.amount,
            0
        );

        // --------------------------------
        // EMPLOYEE SUMMARY
        // --------------------------------

        const employeeMap = {};

        // Add employees from allocations
        currentAllocations.forEach((item) => {

            if (!item.employee) return;

            const id = item.employee._id.toString();

            if (!employeeMap[id]) {
                employeeMap[id] = {
                    employeeId: id,
                    employeeCode: item.employee.employeeCode,
                    name: item.employee.name,
                    moneyGiven: 0,
                    spent: 0,
                    hasAllocation: false
                };
            }

            employeeMap[id].moneyGiven += item.amount;
            employeeMap[id].hasAllocation = true;
        });

        // Add employees from expenses
        currentExpenses.forEach((item) => {

            if (!item.employee) return;

            const id = item.employee._id.toString();

            if (!employeeMap[id]) {
                employeeMap[id] = {
                    employeeId: id,
                    employeeCode: item.employee.employeeCode,
                    name: item.employee.name,
                    moneyGiven: 0,
                    spent: 0,
                    hasAllocation: false
                };
            }

            employeeMap[id].spent += item.amount;
        });

        const employees = Object.values(employeeMap).map(
            (employee) => {

                if (!employee.hasAllocation) {
                    return {
                        ...employee,
                        remaining: null,
                        allocationStatus: "not_recorded"
                    };
                }

                const remaining =
                    employee.moneyGiven - employee.spent;

                return {
                    ...employee,
                    remaining,
                    allocationStatus:
                        remaining < 0
                            ? "over_allocation"
                            : "within_allocation"
                };
            }
        );

        // --------------------------------
        // CATEGORY TOTALS
        // --------------------------------

        const categoryMap = {};

        currentExpenses.forEach((expense) => {

            if (!expense.category) return;

            const id =
                expense.category._id.toString();

            if (!categoryMap[id]) {
                categoryMap[id] = {
                    categoryId: id,
                    name: expense.category.name,
                    total: 0
                };
            }

            categoryMap[id].total += expense.amount;
        });

        const categories =
            Object.values(categoryMap)
                .sort((a, b) => b.total - a.total);

        // --------------------------------
        // RECENT EXPENSES
        // --------------------------------

        const recentExpenses = [...currentExpenses]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .slice(0, 10)
            .map((expense) => ({
                id: expense._id,
                expenseId: expense.expenseId,
                employee: expense.employee
                    ? {
                        name: expense.employee.name,
                        employeeCode:
                            expense.employee.employeeCode
                    }
                    : null,
                category: expense.category
                    ? expense.category.name
                    : "Unknown",
                amount: expense.amount,
                description:
                    expense.description,
                expenseDate:
                    expense.expenseDate,
                createdAt:
                    expense.createdAt
            }));

        // --------------------------------
        // MONTHLY HISTORY
        // --------------------------------

        const historyMap = {};
        const currentKey = getMonthKey(monthStart);

        allocations.forEach((item) => {
            const date = item.allocationDate || item.createdAt;
            const key = getMonthKey(date);

            if (key === currentKey) return;

            if (!historyMap[key]) {
                historyMap[key] = {
                    month: key,
                    label: getMonthLabel(date),
                    totalGiven: 0,
                    totalSpent: 0
                };
            }

            historyMap[key].totalGiven += Number(item.amount || 0);
        });

        expenses.forEach((item) => {
            const date = item.expenseDate || item.createdAt;
            const key = getMonthKey(date);

            if (key === currentKey) return;

            if (!historyMap[key]) {
                historyMap[key] = {
                    month: key,
                    label: getMonthLabel(date),
                    totalGiven: 0,
                    totalSpent: 0
                };
            }

            historyMap[key].totalSpent += Number(item.amount || 0);
        });

        const history = Object.values(historyMap)
            .map((item) => ({
                ...item,
                remaining: item.totalGiven - item.totalSpent
            }))
            .sort((a, b) => b.month.localeCompare(a.month));

        // --------------------------------
        // RESPONSE
        // --------------------------------

        res.status(200).json({
            currentMonth: getMonthLabel(monthStart),

            summary: {
                totalGiven,
                totalSpent,
                remaining:
                    totalGiven - totalSpent
            },

            employees,

            categories,

            recentExpenses,

            history
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to load admin dashboard"
        });
    }
};

module.exports = {
    getAdminDashboard
};