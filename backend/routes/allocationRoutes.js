const express = require("express");

const {
    createAllocation,
    getAllocations,
    updateAllocation
} = require("../controllers/allocationController");

const adminAuth = require("../middleware/adminAuth");

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

module.exports = router;