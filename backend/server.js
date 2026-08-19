const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");

require("dotenv").config();

const requiredEnv = [
    "MONGO_URI",
    "JWT_SECRET"
];

for (const key of requiredEnv) {

    if (!process.env[key]) {

        console.error(
            `Missing required environment variable: ${key}`
        );

        process.exit(1);
    }
}

const app = express();

const employeeRoutes =
    require("./routes/employeeRoutes");

const categoryRoutes =
    require("./routes/categoryRoutes");

const expenseRoutes =
    require("./routes/expenseRoutes");

const adminRoutes =
    require("./routes/adminRoutes");

const allocationRoutes =
    require("./routes/allocationRoutes");

const adminDashboardRoutes =
    require("./routes/adminDashboardRoutes");

const exportRoutes =
    require("./routes/exportRoutes");


// SECURITY

app.use(helmet());


// CORS

const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",")
    : ["http://localhost:5173"];

app.use(
    cors({
        origin: allowedOrigins,
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);


// BODY PARSER

app.use(
    express.json({
        limit: "10kb"
    })
);


// ROUTES

app.use(
    "/api/employees",
    employeeRoutes
);

app.use(
    "/api/expenses",
    expenseRoutes
);

app.use(
    "/api/categories",
    categoryRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);

app.use(
    "/api/allocations",
    allocationRoutes
);

app.use(
    "/api/admin/dashboard",
    adminDashboardRoutes
);

app.use(
    "/api/admin/export",
    exportRoutes
);



// HEALTH CHECK

app.get(
    "/api/hello",
    (req, res) => {
        res.status(200).json({
            message:
                "Expense Manager Backend Working 🚀"
        });
    }
);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB Connected ✅");

        const PORT = process.env.PORT || 2411;

        app.listen(PORT, () => {
            console.log(
                `Server running on http://localhost:${PORT}`
            );
        });

    })
    .catch((error) => {

        console.error(
            "MongoDB Connection Failed ❌"
        );

        console.error(error.message);

    });