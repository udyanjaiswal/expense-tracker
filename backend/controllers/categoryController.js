const Category = require("../models/Category");

const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({
            name: name.trim()
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            name: name.trim()
        });

        res.status(201).json({
            message: "Category created successfully",
            category
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to create category"
        });
    }
};

const getCategories = async (req, res) => {
    try {

        const { status } = req.query;

        let filter = {};

        if (status === "active") {
            filter.status = "active";
        }

        if (status === "inactive") {
            filter.status = "inactive";
        }

        const categories = await Category.find(filter)
            .sort({ name: 1 });

        res.status(200).json({
            categories
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch categories"
        });
    }
};
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                message: "Category name is required"
            });
        }

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        const existingCategory = await Category.findOne({
            name: name.trim(),
            _id: { $ne: id }
        });

        if (existingCategory) {
            return res.status(400).json({
                message: "Category already exists"
            });
        }

        category.name = name.trim();

        await category.save();

        res.status(200).json({
            message: "Category updated successfully",
            category
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update category"
        });
    }
};


const changeCategoryStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        category.status =
            category.status === "active"
                ? "inactive"
                : "active";

        await category.save();

        res.status(200).json({
            message: "Category status updated successfully",
            category
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to update category status"
        });
    }
};

const getActiveCategories = async (req, res) => {
    try {
        const categories = await Category.find({
            status: "active"
        }).sort({ name: 1 });

        res.status(200).json({
            categories
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch active categories"
        });
    }
};


module.exports = {
    createCategory,
    getCategories,
    updateCategory,
    changeCategoryStatus,
    getActiveCategories
};