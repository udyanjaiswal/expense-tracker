const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");

const ADMIN_NAME = "name of admin";
const ADMIN_EMAIL = "mail";
const ADMIN_PASSWORD = "password";

const createAdmin = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await Admin.findOne({
            email: ADMIN_EMAIL
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            12
        );

        await Admin.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword
        });

        console.log("Admin created successfully ✅");

        process.exit(0);

    } catch (error) {

        console.error(
            "Error creating admin:",
            error.message
        );

        process.exit(1);
    }
};

createAdmin();