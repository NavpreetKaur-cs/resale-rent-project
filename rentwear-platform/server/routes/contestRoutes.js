const express = require('express');
const router = express.Router();

const {
  getAllContests,
  getContestById,
  createContest,
  getYourContests,
  submitEntry,
  voteForEntry,
  getLeaderboard,
  updateContest,
  getSubmissions,
  selectWinners
} = require('../controllers/contestController');

const { protect } = require('../middleware/authMiddleware');


router.get('/', getAllContests);


router.get('/your-contests', protect, getYourContests);

router.get('/:id/leaderboard', getLeaderboard);
router.get('/:id', getContestById);

router.post('/', protect, createContest);
router.put('/:id', protect, updateContest);
router.post('/:id/entries', protect, submitEntry);
router.post('/:id/vote', protect, voteForEntry);
router.get('/:id/submissions', protect, getSubmissions);
router.post('/:id/select-winners', protect, selectWinners);

module.exports = router;