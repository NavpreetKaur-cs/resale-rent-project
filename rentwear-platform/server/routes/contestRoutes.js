const express = require('express');
const router = express.Router();
const {
  getAllContests,
  getContestById,
  createContest,
  submitEntry,
  voteForEntry,
  getLeaderboard,
  updateContest,
  getSubmissions,
  selectWinners
} = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllContests);
router.get('/:id', getContestById);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes (user must be logged in)
router.post('/', protect, createContest);
router.put('/:id', protect, updateContest);
router.post('/:id/entries', protect, submitEntry);
router.post('/:id/vote', protect, voteForEntry);
router.get('/:id/submissions', protect, getSubmissions);
router.post('/:id/select-winners', protect, selectWinners);

module.exports = router;
