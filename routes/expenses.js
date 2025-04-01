const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

// Get all expenses for a specific month
router.get('/', protect, async (req, res) => {
  try {
    const { month } = req.query;
    const query = {};

    if (month) {
      const [year, monthNum] = month.split('-');
      query.date = {
        $gte: new Date(year, monthNum - 1, 1),
        $lt: new Date(year, monthNum, 1)
      };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get monthly summary (category-wise expenses)
router.get('/summary', protect, async (req, res) => {
  try {
    const { month } = req.query;
    const query = {};

    if (month) {
      const [year, monthNum] = month.split('-');
      query.date = {
        $gte: new Date(year, monthNum - 1, 1),
        $lt: new Date(year, monthNum, 1)
      };
    }

    const summary = await Expense.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          currency: { $first: '$currency' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export monthly expenses
router.get('/export', protect, async (req, res) => {
  try {
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({ message: 'Month parameter is required (YYYY-MM)' });
    }

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({ message: 'Invalid month format. Use YYYY-MM' });
    }

    // Get start and end dates for the month
    const [year, monthNum] = month.split('-');
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);

    // Fetch expenses for the specified month
    const expenses = await Expense.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: -1 });

    // Calculate summary statistics
    const summary = {
      totalExpenses: 0,
      totalIncome: 0,
      categoryBreakdown: {},
      dailyBreakdown: {},
      currency: req.user.currency
    };

    expenses.forEach(expense => {
      if (expense.type === 'expense') {
        summary.totalExpenses += expense.amount;
        summary.categoryBreakdown[expense.category] = (summary.categoryBreakdown[expense.category] || 0) + expense.amount;
      } else {
        summary.totalIncome += expense.amount;
      }

      // Daily breakdown
      const dateStr = expense.date.toISOString().split('T')[0];
      if (!summary.dailyBreakdown[dateStr]) {
        summary.dailyBreakdown[dateStr] = {
          expenses: 0,
          income: 0,
          transactions: []
        };
      }
      summary.dailyBreakdown[dateStr][expense.type === 'expense' ? 'expenses' : 'income'] += expense.amount;
      summary.dailyBreakdown[dateStr].transactions.push({
        id: expense._id,
        type: expense.type,
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description
      });
    });

    res.json({
      month,
      summary,
      expenses: expenses.map(expense => ({
        id: expense._id,
        type: expense.type,
        category: expense.category,
        amount: expense.amount,
        currency: expense.currency,
        description: expense.description,
        date: expense.date.toISOString(),
        createdAt: expense.createdAt.toISOString()
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting monthly expenses' });
  }
});

// Create new expense
router.post('/', protect, async (req, res) => {
  try {
    const expense = new Expense({
      ...req.body,
      currency: req.user.currency
    });
    const newExpense = await expense.save();
    res.status(201).json(newExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update expense
router.put('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        currency: req.user.currency
      },
      { new: true }
    );
    res.json(expense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete expense
router.delete('/:id', protect, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 