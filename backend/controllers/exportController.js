const ExcelJS = require("exceljs");
const Allocation = require("../models/Allocation");
const Expense = require("../models/Expense");

const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN");
};

// Get selected month range in Asia/Kolkata timezone
const getMonthRange = (month) => {
    if (!month) {
        const now = new Date();

        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kolkata",
            year: "numeric",
            month: "2-digit"
        }).formatToParts(now);

        const year = parts.find(
            (part) => part.type === "year"
        ).value;

        const monthNumber = parts.find(
            (part) => part.type === "month"
        ).value;

        month = `${year}-${monthNumber}`;
    }

    if (!/^\d{4}-\d{2}$/.test(month)) {
        throw new Error("Invalid month. Use YYYY-MM.");
    }

    const [year, monthNumber] = month
        .split("-")
        .map(Number);

    const start = new Date(
        `${year}-${String(monthNumber).padStart(2, "0")}-01T00:00:00+05:30`
    );

    const nextYear =
        monthNumber === 12
            ? year + 1
            : year;

    const nextMonth =
        monthNumber === 12
            ? 1
            : monthNumber + 1;

    const end = new Date(
        `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+05:30`
    );

    return {
        start,
        end
    };
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
        "₹#,##0.00";

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

        const {
            start,
            end
        } = getMonthRange(req.query.month);

        const expenses = await Expense.find({
            employee: employeeId,
            expenseDate: {
                $gte: start,
                $lt: end
            }
        })
            .populate("category", "name")
            .sort({
                expenseDate: 1,
                createdAt: 1
            });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found for this employee in the selected month"
            });
        }

        await createExpenseWorkbook(
            expenses,
            `Employee-Expense-${req.query.month || "Current-Month"}`,
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

        const {
            start,
            end
        } = getMonthRange(req.query.month);

        const expenses = await Expense.find({
            category: categoryId,
            expenseDate: {
                $gte: start,
                $lt: end
            }
        })
            .populate("category", "name")
            .sort({
                expenseDate: 1,
                createdAt: 1
            });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found for this category in the selected month"
            });
        }

        const categoryName =
            expenses[0]?.category?.name ||
            "Category";

        await createExpenseWorkbook(
            expenses,
            `${categoryName}-Expense-${req.query.month || "Current-Month"}`,
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

        const {
            start,
            end
        } = getMonthRange(req.query.month);

        const expenses = await Expense.find({
            expenseDate: {
                $gte: start,
                $lt: end
            }
        })
            .populate("category", "name")
            .sort({
                expenseDate: 1,
                createdAt: 1
            });

        if (expenses.length === 0) {
            return res.status(404).json({
                message: "No expenses found in the selected month"
            });
        }

        await createExpenseWorkbook(
            expenses,
            `Head-Office-Expense-${req.query.month || "Current-Month"}`,
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