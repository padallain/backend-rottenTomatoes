const Category = require('../models/category.model'); // Assuming you have a Category model

class CategoryController {
  // Create a new category
  async createCategory(req, res) {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Category title is required' });
    }

    try {
      const newCategory = new Category({ title });
      await newCategory.save();
      res.status(201).json({ message: 'Category created successfully', newCategory });
    } catch (err) {
      console.error('Error creating category:', err);
      res.status(500).json({ message: 'Error creating category' });
    }
  }

  // Get all categories
  async getCategories(req, res) {
    try {
      const categories = await Category.find();
      res.status(200).json(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ message: 'Error fetching categories' });
    }
  }

  // Update a category by ID
  async updateCategory(req, res) {
    const { categoryId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Category title is required' });
    }

    try {
      const updatedCategory = await Category.findByIdAndUpdate(
        categoryId,
        { title },
        { new: true } // Return the updated category
      );

      if (!updatedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json({ message: 'Category updated successfully', updatedCategory });
    } catch (err) {
      console.error('Error updating category:', err);
      res.status(500).json({ message: 'Error updating category' });
    }
  }

  // Delete a category by ID
  async deleteCategory(req, res) {
    const { categoryId } = req.params;

    try {
      const deletedCategory = await Category.findByIdAndDelete(categoryId);

      if (!deletedCategory) {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
      console.error('Error deleting category:', err);
      res.status(500).json({ message: 'Error deleting category' });
    }
  }
}

module.exports = new CategoryController();
