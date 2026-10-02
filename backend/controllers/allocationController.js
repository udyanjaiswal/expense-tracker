const Allocation = require("../models/Allocation");
const Employee = require("../models/Employee");
const Expense = require("../models/Expense");
const { getMonthRange, getMonthLabel, toPaise, fromPaise } = require("../utils/month");

const generateAllocationId = () => {
    const randomNumber = Math.floor(
        100000 + Math.random() * 900000
    );

    return `ALC-${randomNumber}`;
};

const createAllocation = async (req, res) => {
    try {
        const {
            employee,
            amount,
            type,
            note
        } = req.body;

        if (!employee) {
            return res.status(400).json({
                message: "Employee is required"
            });
        }

        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({
                message: "Valid amount is required"
            });
        }

        const existingEmployee = await Employee.findOne({
            _id: employee,
            status: "active"
        });

        if (!existingEmployee) {
            return res.status(400).json({
                message: "Invalid or inactive employee"
            });
        }

        const allocation = await Allocation.create({
            allocationId: generateAllocationId(),
            employee,
            amount: numericAmount,
            type: type || "allocation",
            note: note?.trim() || ""
        });

        const populatedAllocation =
            await Allocation.findById(
                allocation._id
            ).populate(
                "employee",
                "name employeeCode"
            );

        res.status(201).json({
            message: "Money record added successfully",
            allocation: populatedAllocation
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to add money record"
        });
    }
};

const getAllocations = async (req, res) => {
    try {
        const allocations = await Allocation.find()
            .populate("employee", "name employeeCode")
            .sort({ allocationDate: -1, createdAt: -1 });

        res.status(200).json({
            allocations
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch money records"
        });
    }
};

const updateAllocation = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            amount,
            type,
            note,
            allocationDate
        } = req.body;

        const allocation = await Allocation.findById(id);

        if (!allocation) {
            return res.status(404).json({
                message: "Allocation not found"
            });
        }

        if (amount !== undefined) {
            const numericAmount = Number(amount);
            if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
                return res.status(400).json({
                    message: "Valid amount is required"
                });
            }

            allocation.amount = numericAmount;
        }

        if (type !== undefined) {
            if (!["allocation", "additional"].includes(type)) {
                return res.status(400).json({
                    message: "Invalid allocation type"
                });
            }

            allocation.type = type;
        }

        if (note !== undefined) {
            allocation.note = note.trim();
        }

        if (allocationDate !== undefined) {
            allocation.allocationDate = allocationDate;
        }

        await allocation.save();

        const updatedAllocation =
            await Allocation.findById(
                allocation._id
            ).populate(
                "employee",
                "name employeeCode"
            );

        res.status(200).json({
            message: "Allocation updated successfully",
            allocation: updatedAllocation
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update allocation"
        });
    }
};

const getMyAllocationSummary = async (req, res) => {

    try {

        const employeeId = req.employee._id;
        const { start: monthStart, end: nextMonthStart } = getMonthRange();
        const allocations = await Allocation.find({
            employee: employeeId,
            allocationDate: {
                $gte: monthStart,
                $lt: nextMonthStart
            }
        });

        const expenses = await Expense.find({
            employee: employeeId,
            expenseDate: {
                $gte: monthStart,
                $lt: nextMonthStart
            }
        });

        const totalAllocatedPaise = allocations.reduce(
            (total, allocation) => total + toPaise(allocation.amount), 0
        );

        const totalSpentPaise = expenses.reduce(
            (total, expense) => total + toPaise(expense.amount), 0
        );

        const totalAllocated = fromPaise(totalAllocatedPaise);
        const totalSpent = fromPaise(totalSpentPaise);
        const remaining = fromPaise(totalAllocatedPaise - totalSpentPaise);

        res.status(200).json({

            currentMonth: getMonthLabel(monthStart),

            totalAllocated,

            totalSpent,

            remaining,
            period: {
                label: getMonthLabel(monthStart),
                start: monthStart,
                end: nextMonthStart
            }

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch allocation summary"
        });

    }

};

module.exports = {
    createAllocation,
    getAllocations,
    updateAllocation,
    getMyAllocationSummary

};
