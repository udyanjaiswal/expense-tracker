const express = require("express");

const {
    getAdminDashboard
} = require("../controllers/adminDashboardController");

const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.get(
    "/",
    adminAuth,
    getAdminDashboard
);

module.exports = router;