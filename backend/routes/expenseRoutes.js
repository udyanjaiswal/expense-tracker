const express = require("express");

const {
    createExpense,
    updateMyExpense,
    getAllExpenses
} = require("../controllers/expenseController");

const employeeAuth = require("../middleware/employeeAuth");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post(
    "/",
    employeeAuth,
    createExpense,
    
);

router.put(
    "/:id",
    employeeAuth,
    updateMyExpense
);

router.get(
    "/",
    adminAuth,
    getAllExpenses
)

module.exports = router;