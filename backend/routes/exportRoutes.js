const express = require("express");

const adminAuth =
    require("../middleware/adminAuth");

const {
    exportEmployeeReport,
    exportCategoryReport,
    exportHeadOfficeReport
} = require("../controllers/exportController");

const router = express.Router();

router.get(
    "/employee/:employeeId",
    adminAuth,
    exportEmployeeReport
);

router.get(
    "/category/:categoryId",
    adminAuth,
    exportCategoryReport
);

router.get(
    "/head-office",
    adminAuth,
    exportHeadOfficeReport
);

module.exports = router;