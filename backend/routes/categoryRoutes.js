const express = require("express")

const adminAuth = require("../middleware/adminAuth")
const {
    createCategory,
    getCategories,
    updateCategory,
    changeCategoryStatus,
    getActiveCategories
} = require("../controllers/categoryController")

const employeeAuth = require("../middleware/employeeAuth");


const router = express.Router();

router.post("/" , adminAuth , createCategory);
router.get("/",adminAuth , getCategories);
router.get(
    "/active",
    employeeAuth,
    getActiveCategories
);

router.put(
    "/:id",
    adminAuth,
    updateCategory
);

router.put(
    "/:id/status",
    adminAuth,
    changeCategoryStatus
);

module.exports = router;