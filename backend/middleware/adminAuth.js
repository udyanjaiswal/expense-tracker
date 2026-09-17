const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const adminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Admin authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "admin") {
            return res.status(403).json({
                message: "Invalid admin access"
            });
        }

        const admin = await Admin.findOne({
            _id: decoded.adminId,
            status: "active"
        }).select("-password");

        if (!admin) {
            return res.status(401).json({
                message: "Admin not found or inactive"
            });
        }

        req.admin = admin;

        next();

    } catch (error) {
        console.error(error.message);

        return res.status(401).json({
            message: "Invalid or expired admin session"
        });
    }
};

module.exports = adminAuth;