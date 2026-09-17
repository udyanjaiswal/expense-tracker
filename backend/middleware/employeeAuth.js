const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

const employeeAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Employee authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (decoded.role !== "employee") {
            return res.status(403).json({
                message: "Invalid employee access"
            });
        }

        const employee = await Employee.findOne({
            _id: decoded.employeeId,
            status: "active"
        }).select("-pinHash");

        if (!employee) {
            return res.status(401).json({
                message: "Employee not found or inactive"
            });
        }

        req.employee = employee;

        next();

    } catch (error) {
        console.error(error.message);

        return res.status(401).json({
            message: "Invalid or expired employee session"
        });
    }
};

module.exports = employeeAuth;