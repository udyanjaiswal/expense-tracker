const rateLimit = require("express-rate-limit");

const adminLoginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        message: "Too many login attempts. Please try again later."
    }
});

const employeePinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,

    standardHeaders: true,
    legacyHeaders: false,

    message: {
        message: "Too many PIN attempts. Please try again later."
    }
});

module.exports = {
    adminLoginLimiter,
    employeePinLimiter
};