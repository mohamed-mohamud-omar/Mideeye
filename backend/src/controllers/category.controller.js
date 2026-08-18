import { Category } from '../models/Category.js';
import { Book } from '../models/Book.js';

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Aggregate real book counts per category
    const bookCounts = await Book.aggregate([
      { $match: { status: 'ACTIVE' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    bookCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const enrichedCategories = categories.map((cat) => ({
      ...cat.toObject(),
      bookCount: countMap[cat.name] || 0
    }));

    res.json({
      success: true,
      data: enrichedCategories
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, featured } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await Category.findOne({ slug });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Category already exists'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      icon: icon || 'Book',
      featured: Boolean(featured)
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
