const express = require("express");

const employeeAuth =
    require("../middleware/employeeAuth");

const adminAuth =
    require("../middleware/adminAuth");

const {
    createEmployee,
    getEmployees,
    verifyEmployeePin,
    getMyExpenses,
    changeEmployeePin,
    changeEmployeeStatus,
    getActiveEmployees
} = require("../controllers/employeeController");

const {
    employeePinLimiter
} = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
    "/",
    adminAuth,
    createEmployee
);

router.get(
    "/",
    adminAuth,
    getEmployees
);

router.post(
    "/verify-pin",
    employeePinLimiter,
    verifyEmployeePin
);

router.get(
    "/me",
    employeeAuth,
    (req, res) => {
        res.status(200).json({
            message:
                "Employee authenticated successfully",
            employee: req.employee
        });
    }
);

router.get(
    "/my-expenses",
    employeeAuth,
    getMyExpenses
);

router.put(
    "/:id/pin",
    adminAuth,
    changeEmployeePin
);

router.put(
    "/:id/status",
    adminAuth,
    changeEmployeeStatus
);

router.get(
    "/active",
    adminAuth,
    getActiveEmployees
);

module.exports = router;