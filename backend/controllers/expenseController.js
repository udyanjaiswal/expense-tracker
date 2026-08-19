const Expense = require("../models/Expense");
const Category = require("../models/Category");

const generateExpenseId = async () => {

    let expenseId;
    let exists = true;

    while (exists) {

        const randomNumber = Math.floor(
            10000 + Math.random() * 900000
        );

        expenseId = `EXP-${randomNumber}`;

        exists = await Expense.exists({
            expenseId
        });
    }

    return expenseId;
};

const createExpense = async (req, res) => {
    try {
        const {
            category,
            amount,
            description
        } = req.body;

        // Basic validation
        if (!category) {
            return res.status(400).json({
                message: "Category is required"
            });
        }

        if (!amount || Number(amount) <= 0) {
            return res.status(400).json({
                message: "Valid amount is required"
            });
        }

        // Check category exists and is active
        const existingCategory = await Category.findOne({
            _id: category,
            status: "active"
        });

        if (!existingCategory) {
            return res.status(400).json({
                message: "Invalid or inactive category"
            });
        }

        // Create expense
        const expense = await Expense.create({
            expenseId: await generateExpenseId(),

            // IMPORTANT:
            // Employee comes from JWT middleware
            // NOT from frontend
            employee: req.employee._id,

            category,

            amount: Number(amount),

            description: description?.trim() || ""
        });

        const populatedExpense = await Expense.findById(
            expense._id
        ).populate("category", "name");

        res.status(201).json({
            message: "Expense submitted successfully",
            expense: populatedExpense
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to submit expense"
        });
    }
};

const updateMyExpense = async (req , res) => {
    try{
        const {id} = req.params;
        const {category , amount ,description} = req.body;

        if (!category){
            return res.status(400).json({
                message:"Category is required"
            })
        }
        if ( !amount || Number(amount) <= 0){
            return res.status(400).json({
                message:"Valid amount is required"
            });
        }

        const existingCategory = await Category.findOne({
            _id:category,
            status:"active"
        })

        if (!existingCategory){
            return res.status(400).json({
                message:"Invalid Category"
            });
        }

        const expense = await Expense.findOne({
            _id:id,
            employee:req.employee._id
            
        });
        if (!expense){
            return res.status(404).json({
                message:"Expense Not found"
            });
        }

        expense.category = category;
        expense.amount = Number(amount);
        expense.description = description?.trim() || "";

        await expense.save();

        const updatedExpense = await Expense.findById(
            expense._id
        ).populate("category" , "name");

        res.status(200).json({
            message:"Expense Updated Successfully",
            expense:updatedExpense
        })
    }
    catch(err) {
        console.error(err);

        res.status(500).json({
            message:"Failed"
        })
    }
}

const getAllExpenses = async (req, res) => {
    try {
        const { employee, category } = req.query;

        const filter = {};

        if (employee) {
            filter.employee = employee;
        }

        if (category) {
            filter.category = category;
        }

        const expenses = await Expense.find(filter)
            .populate("employee", "name employeeCode")
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

module.exports = {
    createExpense,
    updateMyExpense,
    getAllExpenses,
};