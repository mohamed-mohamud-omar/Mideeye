import { Book } from '../models/Book.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: 'SUCCESS' });
    const pendingPayments = await Order.countDocuments({ paymentStatus: 'PENDING' });
    const lowStockBooks = await Book.countDocuments({ stock: { $gt: 0, $lte: 5 } });
    const outOfStockBooks = await Book.countDocuments({ stock: 0 });

    // Total Revenue from paid non-cancelled orders
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'SUCCESS', orderStatus: { $ne: 'CANCELLED' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

    // Monthly Sales Chart Data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'SUCCESS',
          orderStatus: { $ne: 'CANCELLED' },
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          ordersCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly data with month names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedMonthlySales = monthlySales.map((item) => ({
      name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      revenue: Math.round(item.revenue * 100) / 100,
      orders: item.ordersCount
    }));

    // Top Selling Books
    const topBooks = await Book.find({ status: 'ACTIVE' })
      .sort({ totalSold: -1 })
      .limit(5)
      .select('title author coverImage price totalSold stock rating totalReviews');

    // Sales by Category
    const categorySales = await Order.aggregate([
      { $match: { paymentStatus: 'SUCCESS', orderStatus: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'books',
          localField: 'items.bookId',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      { $unwind: { path: '$bookDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$bookDetails.category',
          totalAmount: { $sum: '$items.subtotal' },
          count: { $sum: '$items.quantity' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Recent 5 Orders
    const recentOrders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        metrics: {
          totalBooks,
          totalCustomers,
          totalOrders,
          paidOrders,
          pendingPayments,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          lowStockBooks,
          outOfStockBooks
        },
        charts: {
          monthlySales: formattedMonthlySales,
          categorySales: categorySales.map((c) => ({
            category: c._id || 'Uncategorized',
            totalAmount: parseFloat(c.totalAmount.toFixed(2)),
            quantity: c.count
          }))
        },
        topBooks,
        recentOrders
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomersList = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query = { role: 'CUSTOMER' };

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: new RegExp(s, 'i') },
        { email: new RegExp(s, 'i') },
        { phone: new RegExp(s, 'i') }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const customers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum
      }
    });
  } catch (error) {
    next(error);
  }
};
