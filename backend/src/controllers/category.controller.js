const Category = require('../models/category.model');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    return res.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error in getAllCategories:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};