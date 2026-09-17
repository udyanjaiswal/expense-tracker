const mongoose = require("mongoose");

const allocationSchema = new mongoose.Schema(
    {
        allocationId: {
            type: String,
            required: true,
            unique: true
        },

        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        type: {
            type: String,
            enum: ["allocation", "additional"],
            default: "allocation"
        },

        note: {
            type: String,
            trim: true,
            default: ""
        },

        allocationDate: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Allocation",
    allocationSchema
);