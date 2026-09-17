const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        employeeCode: {
            type:String,
            required:true,
            unique : true,
            trim : true,
            uppercase: true
        },
        pinHash: {
            type:String,
            required:true
        },
        status:{
            type:String,
            enum:["active" , "inactive"],
            default: "active"
        }

    },
    {
        timestamps:true
    }
    
);

module.exports = mongoose.model("Employee" , employeeSchema)