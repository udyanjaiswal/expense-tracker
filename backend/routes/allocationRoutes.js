const express = require("express");

const {
    createAllocation,
    getAllocations,
    updateAllocation,
    getMyAllocationSummary
} = require("../controllers/allocationController");

const adminAuth = require("../middleware/adminAuth");

const employeeAuth = require("../middleware/employeeAuth");

const router = express.Router();

router.post(
    "/",
    adminAuth,
    createAllocation
);
router.get(
    "/",
    adminAuth,
    getAllocations
);
router.put(
    "/:id",
    adminAuth,
    updateAllocation
);


router.get(
    "/my-summary",
    employeeAuth,
    getMyAllocationSummary
);

module.exports = router;