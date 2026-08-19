const Allocation = require("../models/Allocation");
const Expense = require("../models/Expense");

const getAdminDashboard = async (req, res) => {
    try {
        // Get all allocations
        const allocations = await Allocation.find()
            .populate("employee", "name employeeCode")
            .lean();

        // Get all expenses
        const expenses = await Expense.find()
            .populate("employee", "name employeeCode")
            .populate("category", "name")
            .lean();

        // --------------------------------
        // OVERALL TOTALS
        // --------------------------------

        const totalGiven = allocations.reduce(
            (total, item) => total + item.amount,
            0
        );

        const totalSpent = expenses.reduce(
            (total, item) => total + item.amount,
            0
        );

        // --------------------------------
        // EMPLOYEE SUMMARY
        // --------------------------------

        const employeeMap = {};

        // Add employees from allocations
        allocations.forEach((item) => {

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
        expenses.forEach((item) => {

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

        expenses.forEach((expense) => {

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

        const recentExpenses = [...expenses]
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
        // RESPONSE
        // --------------------------------

        res.status(200).json({
            summary: {
                totalGiven,
                totalSpent,
                remaining:
                    totalGiven - totalSpent
            },

            employees,

            categories,

            recentExpenses
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