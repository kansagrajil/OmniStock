const Category = require('../models/Category');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ createdBy: req.user.id }).sort({ name: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Private
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found or not authorized' });
        }

        res.json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const categoryExists = await Category.findOne({ name: name.trim(), createdBy: req.user._id });
        if (categoryExists) {
            return res.status(400).json({ message: 'Category already exists for your account' });
        }

        const category = await Category.create({
            name: name.trim(),
            description: description ? description.trim() : '',
            createdBy: req.user._id
        });

        console.log('[Category] Created:', category.name);
        res.status(201).json(category);
    } catch (error) {
        console.error('[Category Error] Save failed:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found or not authorized' });
        }

        // Check if name is taken by another category of the same user
        if (req.body.name && req.body.name !== category.name) {
            const nameExists = await Category.findOne({ name: req.body.name, createdBy: req.user.id });
            if (nameExists) {
                return res.status(400).json({ message: 'Category name already exists' });
            }
        }

        category.name = req.body.name || category.name;
        category.description = req.body.description || category.description;

        const updatedCategory = await category.save();
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!category) {
            return res.status(404).json({ message: 'Category not found or not authorized' });
        }

        await category.deleteOne();
        res.json({ message: 'Category removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
