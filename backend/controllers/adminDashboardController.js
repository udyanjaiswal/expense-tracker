const Allocation = require("../models/Allocation");
const Employee = require("../models/Employee");
const Expense = require("../models/Expense");
const { getMonthRange, getMonthKey, getMonthLabel, toPaise, fromPaise } = require("../utils/month");

const getAdminDashboard = async (req, res) => {
    try {
        const period = getMonthRange();
        const [allAllocations, allExpenses, activeEmployees] = await Promise.all([
            Allocation.find().populate("employee", "name employeeCode").lean(),
            Expense.find().populate("employee", "name employeeCode").populate("category", "name").lean(),
            Employee.find({ status: "active" }).select("name employeeCode").lean()
        ]);

        const inPeriod = (date) => {
            const value = new Date(date);
            return Number.isFinite(value.getTime()) && value >= period.start && value < period.end;
        };
        const allocations = allAllocations.filter((item) => inPeriod(item.allocationDate || item.createdAt));
        const expenses = allExpenses.filter((item) => inPeriod(item.expenseDate || item.createdAt));
        const totalGivenPaise = allocations.reduce((total, item) => total + toPaise(item.amount), 0);
        const totalSpentPaise = expenses.reduce((total, item) => total + toPaise(item.amount), 0);

        const employeeMap = {};
        activeEmployees.forEach((employee) => {
            const id = employee._id.toString();
            employeeMap[id] = {
                employeeId: id,
                employeeCode: employee.employeeCode,
                name: employee.name,
                moneyGivenPaise: 0,
                spentPaise: 0,
                hasAllocation: false
            };
        });

        allocations.forEach((item) => {
            if (!item.employee) return;
            const id = item.employee._id.toString();
            if (!employeeMap[id]) {
                employeeMap[id] = {
                    employeeId: id,
                    employeeCode: item.employee.employeeCode,
                    name: item.employee.name,
                    moneyGivenPaise: 0,
                    spentPaise: 0,
                    hasAllocation: false
                };
            }
            employeeMap[id].moneyGivenPaise += toPaise(item.amount);
            employeeMap[id].hasAllocation = true;
        });

        expenses.forEach((item) => {
            if (!item.employee) return;
            const id = item.employee._id.toString();
            if (!employeeMap[id]) {
                employeeMap[id] = {
                    employeeId: id,
                    employeeCode: item.employee.employeeCode,
                    name: item.employee.name,
                    moneyGivenPaise: 0,
                    spentPaise: 0,
                    hasAllocation: false
                };
            }
            employeeMap[id].spentPaise += toPaise(item.amount);
        });

        const employees = Object.values(employeeMap).map((employee) => {
            const moneyGiven = fromPaise(employee.moneyGivenPaise);
            const spent = fromPaise(employee.spentPaise);
            if (!employee.hasAllocation) {
                return { ...employee, moneyGiven, spent, remaining: null, allocationStatus: "not_recorded" };
            }
            const remaining = fromPaise(employee.moneyGivenPaise - employee.spentPaise);
            return {
                ...employee,
                moneyGiven,
                spent,
                remaining,
                allocationStatus: remaining < 0 ? "over_allocation" : "within_allocation"
            };
        });

        const categoryMap = {};
        expenses.forEach((expense) => {
            if (!expense.category) return;
            const id = expense.category._id.toString();
            if (!categoryMap[id]) {
                categoryMap[id] = { categoryId: id, name: expense.category.name, totalPaise: 0 };
            }
            categoryMap[id].totalPaise += toPaise(expense.amount);
        });
        const categories = Object.values(categoryMap)
            .map((category) => ({ ...category, total: fromPaise(category.totalPaise) }))
            .sort((a, b) => b.total - a.total);

        const recentExpenses = [...expenses]
            .sort((a, b) => new Date(b.expenseDate || b.createdAt) - new Date(a.expenseDate || a.createdAt))
            .slice(0, 10)
            .map((expense) => ({
                id: expense._id,
                expenseId: expense.expenseId,
                employee: expense.employee
                    ? { name: expense.employee.name, employeeCode: expense.employee.employeeCode }
                    : null,
                category: expense.category ? expense.category.name : "Unknown",
                amount: expense.amount,
                description: expense.description,
                expenseDate: expense.expenseDate || expense.createdAt,
                createdAt: expense.createdAt
            }));

        const currentKey = getMonthKey(period.start);
        const historyMap = {};
        const ensureHistoryMonth = (date) => {
            const month = getMonthKey(date);
            if (month === currentKey) return null;
            if (!historyMap[month]) {
                historyMap[month] = {
                    month,
                    label: getMonthLabel(date),
                    totalGivenPaise: 0,
                    totalSpentPaise: 0
                };
            }
            return historyMap[month];
        };
        allAllocations.forEach((item) => {
            const date = item.allocationDate || item.createdAt;
            const month = ensureHistoryMonth(date);
            if (month) month.totalGivenPaise += toPaise(item.amount);
        });
        allExpenses.forEach((item) => {
            const date = item.expenseDate || item.createdAt;
            const month = ensureHistoryMonth(date);
            if (month) month.totalSpentPaise += toPaise(item.amount);
        });
        const history = Object.values(historyMap)
            .map((item) => ({
                month: item.month,
                label: item.label,
                totalGiven: fromPaise(item.totalGivenPaise),
                totalSpent: fromPaise(item.totalSpentPaise),
                remaining: fromPaise(item.totalGivenPaise - item.totalSpentPaise)
            }))
            .sort((a, b) => b.month.localeCompare(a.month));

        res.status(200).json({
            currentMonth: getMonthLabel(period.start),
            summary: {
                totalGiven: fromPaise(totalGivenPaise),
                totalSpent: fromPaise(totalSpentPaise),
                remaining: fromPaise(totalGivenPaise - totalSpentPaise),
                period: { label: getMonthLabel(period.start), start: period.start, end: period.end }
            },
            employees,
            categories,
            recentExpenses,
            history
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to load admin dashboard" });
    }
};

module.exports = { getAdminDashboard };
