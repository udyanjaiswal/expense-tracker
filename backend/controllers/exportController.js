const ExcelJS = require("exceljs");
const Allocation = require("../models/Allocation");
const Expense = require("../models/Expense");

const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN");
};

const createExpenseWorkbook = (
    expenses,
    filename,
    res
) => {
    const workbook = new ExcelJS.Workbook();

    const sheet = workbook.addWorksheet("Expenses");

    sheet.columns = [
        {
            header: "Date",
            key: "date",
            width: 15
        },
        {
            header: "Category",
            key: "category",
            width: 25
        },
        {
            header: "Amount",
            key: "amount",
            width: 18
        },
        {
            header: "Description",
            key: "description",
            width: 45
        }
    ];

    let total = 0;

    expenses.forEach((expense) => {

        const amount =
            Number(expense.amount || 0);

        total += amount;

        sheet.addRow({
            date: formatDate(
                expense.expenseDate
            ),

            category:
                expense.category?.name ||
                "Unknown",

            amount,

            description:
                expense.description || ""
        });
    });

    // TOTAL ROW
    const totalRow = sheet.addRow({
        date: "TOTAL",
        amount: total
    });

    totalRow.font = {
        bold: true
    };

    sheet.getColumn("amount").numFmt =
        '₹#,##0.00';

    sheet.getRow(1).font = {
        bold: true
    };

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.xlsx"`
    );

    return workbook.xlsx.write(res);
};


/*
    EMPLOYEE-WISE
*/

const exportEmployeeReport = async (req, res) => {

    try {

        const { employeeId } = req.params;

        const expenses = await Expense.find({
            employee: employeeId
        })
            .populate("category", "name")
            .sort({
                expenseDate: 1,
                createdAt: 1
            });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found for this employee"
            });
        }

        await createExpenseWorkbook(
            expenses,
            "Employee-Expense-Report",
            res
        );

        res.end();

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to export employee report"
        });
    }
};


/*
    CATEGORY-WISE
*/

const exportCategoryReport = async (req, res) => {

    try {

        const { categoryId } = req.params;

        const expenses = await Expense.find({
            category: categoryId
        })
            .populate("category", "name")
            .sort({
                expenseDate: 1,
                createdAt: 1
            });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found for this category"
            });
        }

        const categoryName =
            expenses[0]?.category?.name ||
            "Category";

        await createExpenseWorkbook(
            expenses,
            `${categoryName}-Expense-Report`,
            res
        );

        res.end();

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to export category report"
        });
    }
};


/*
    HEAD OFFICE
*/

const exportHeadOfficeReport = async (req, res) => {

    try {

        const expenses = await Expense.find()
            .populate("category", "name")
            .sort({
                expenseDate: 1,
                createdAt: 1
            });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found"
            });
        }

        await createExpenseWorkbook(
            expenses,
            "Head-Office-Expense-Report",
            res
        );

        res.end();

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message:
                "Failed to export Head Office report"
        });
    }
};


module.exports = {
    exportEmployeeReport,
    exportCategoryReport,
    exportHeadOfficeReport
};