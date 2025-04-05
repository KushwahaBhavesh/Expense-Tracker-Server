const Expense = require('../models/Expense');
const User = require('../models/User');
const ObjectId = require('mongoose').Types.ObjectId

// Get all expenses for a user
exports.getExpenses = async (req, res) => {
  try {
    const { month, userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const matchStage = {
      userId: new ObjectId(userId)
    };

    if (month) {
      const [year, monthNum] = month.split('-').map(Number);

      if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
        return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
      }

      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 1);

      matchStage.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    const expenses = await Expense.aggregate([
      { $match: matchStage }
    ]);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error', error });
  }
};


// Get monthly summary for a user
exports.getMonthlySummary = async (req, res) => {
  try {
    const { month, userId } = req.query;

    if (!month || !userId) {
      return res.status(400).json({ message: "Missing 'month' or 'userId' query parameter." });
    }

    const [year, monthNum] = month.split('-').map(Number);

    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Invalid 'month' format. Use 'YYYY-MM'." });
    }

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          date: { $gte: startDate, $lt: endDate }
        }
      }
    ]);

    const totalIncome = expenses
      .filter(exp => exp.type === 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const totalExpenses = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const categoryBreakdown = expenses
      .filter(exp => exp.type === 'expense')
      .reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {});

    const formattedBreakdown = Object.entries(categoryBreakdown).map(([category, total]) => ({
      category,
      total
    }));

    res.json({
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown: formattedBreakdown
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error', error });
  }
};

// Add a new expense
exports.addExpense = async (req, res) => {
  try {
    const { description, amount, category, date, type } = req.body;

    const expense = new Expense({
      description,
      amount,
      category,
      date: date || new Date(),
      type,
      userId: req.user.userId // Use authenticated user ID
    });



    const savedExpense = await expense.save();
    res.status(201).json(savedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error', error });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const { description, amount, category, date, type } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id // Ensure expense belongs to user
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.description = description || expense.description;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.type = type || expense.type;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error', error });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error', error });
  }
};

// Export expenses
exports.exportExpenses = async (req, res) => {
  try {
    const { month } = req.query;
    const [year, monthNum] = month.split('-');

    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }).sort({ date: 1 });

    // Create CSV content
    const csvContent = [
      ['Date', 'Description', 'Category', 'Type', 'Amount'],
      ...expenses.map(exp => [
        exp.date.toISOString().split('T')[0],
        exp.description,
        exp.category,
        exp.type,
        exp.amount
      ])
    ].map(row => row.join(',')).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses-${month}.csv`);
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server error', error });
  }
}; 