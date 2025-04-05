const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getExpenses,
  getMonthlySummary,
  addExpense,
  updateExpense,
  deleteExpense,
  exportExpenses
} = require('../controllers/expenseController');

router.get('/', protect, getExpenses);
router.get('/summary', protect, getMonthlySummary);
router.post('/', protect, addExpense);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);
router.get('/export', protect, exportExpenses);

module.exports = router;