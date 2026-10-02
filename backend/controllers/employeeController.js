const bcrypt = require("bcryptjs");
const Employee = require("../models/Employee");
const jwt = require("jsonwebtoken");
const Expense = require("../models/Expense");

const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};

const createEmployee = async (req, res) => {
    try {
        const { name, employeeCode } = req.body;

        if (!name || !employeeCode) {
            return res.status(400).json({
                message: "Name and Code are required"
            });
        }

        const existingEmployee = await Employee.findOne({
            employeeCode: employeeCode.toUpperCase()
        });

        if (existingEmployee) {
            return res.status(400).json({
                message: "Employee code already exists"
            });

        }

        const pin = generatePin();
        const pinHash = await bcrypt.hash(pin, 10);

        const employee = await Employee.create({
            name,
            employeeCode,
            pinHash
        });

        res.status(201).json({
            message: "Employee created successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                employeeCode: employee.employeeCode,
                status: employee.status
            },
            generatedPin : pin
        })
    }
    catch (error){
        console.error(error);
        res.status(500).json({
            message:"Failed"
        })
    }
};

const getEmployees = async (req, res) => {
    try {

        const { status } = req.query;

        let filter = {};

        if (status === "active") {
            filter.status = "active";
        }

        if (status === "inactive") {
            filter.status = "inactive";
        }

        const employees = await Employee.find(filter)
            .select("-pinHash")
            .sort({ createdAt: -1 });

        res.status(200).json({
            employees
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch employees"
        });
    }
};

const verifyEmployeePin = async (req, res) => {
    try {
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({
                message: "PIN is required"
            });
        }

        const employees = await Employee.find({
            status: "active"
        });

        let matchedEmployee = null;

        for (const employee of employees) {
            const isMatch = await bcrypt.compare(
                pin.toString(),
                employee.pinHash
            );

            if (isMatch) {
                matchedEmployee = employee;
                break;
            }
        }

        if (!matchedEmployee) {
            return res.status(401).json({
                message: "Invalid PIN"
            });
        }

        const token = jwt.sign(
            {
                employeeId: matchedEmployee._id,
                role: "employee"
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "84h"
            }
        );

        res.status(200).json({
            message: "PIN verified successfully",

            token,

            employee: {
                id: matchedEmployee._id,
                name: matchedEmployee.name,
                employeeCode: matchedEmployee.employeeCode
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "PIN verification failed"
        });
    }
};

const getMyExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({
            employee: req.employee._id
        })
            .populate("category", "name")
            .sort({
                expenseDate: -1,
                createdAt: -1
            });

        res.status(200).json({
            expenses
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch expenses"
        });
    }
};

const changeEmployeePin = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        const newPin = generatePin();

        employee.pinHash = await bcrypt.hash(newPin, 10);

        await employee.save();

        res.status(200).json({
            message: "Employee PIN changed successfully",
            generatedPin: newPin
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to change employee PIN"
        });
    }
};


const changeEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const employee = await Employee.findById(id);

        if (!employee) {
            return res.status(404).json({
                message: "Employee not found"
            });
        }

        employee.status =
            employee.status === "active"
                ? "inactive"
                : "active";

        await employee.save();

        res.status(200).json({
            message: "Employee status updated successfully",
            employee: {
                id: employee._id,
                name: employee.name,
                employeeCode: employee.employeeCode,
                status: employee.status
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update employee status"
        });
    }
};

const getActiveEmployees = async (req, res) => {
    try {
        const employees = await Employee.find({
            status: "active"
        })
            .select("-pinHash")
            .sort({ name: 1 });

        res.status(200).json({
            employees
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch active employees"
        });
    }
};

module.exports = {
    createEmployee,
    getEmployees,
    verifyEmployeePin,
    getMyExpenses,
    changeEmployeePin,
    changeEmployeeStatus,
    getActiveEmployees
};
