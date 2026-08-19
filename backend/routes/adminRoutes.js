const express = require("express");

const {
    loginAdmin
} = require("../controllers/adminController");

const adminAuth = require("../middleware/adminAuth");

const {
    adminLoginLimiter
} = require("../middleware/rateLimiter");

const router = express.Router();

router.post(
    "/login",
    adminLoginLimiter,
    loginAdmin
);

router.get(
    "/me",
    adminAuth,
    (req, res) => {
        res.status(200).json({
            message: "Admin authenticated successfully",
            admin: req.admin
        });
    }
);

module.exports = router;