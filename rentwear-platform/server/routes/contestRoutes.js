const express = require('express');
const router = express.Router();
const {
  getAllContests,
  getContestById,
  createContest,
  submitEntry,
  voteForEntry,
  getLeaderboard
} = require('../controllers/contestController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllContests);
router.get('/:id', getContestById);
router.get('/:id/leaderboard', getLeaderboard);

// Protected routes (user must be logged in)
router.post('/', protect, createContest);
router.post('/:id/entries', protect, submitEntry);
router.post('/:id/vote', protect, voteForEntry);

module.exports = router;
