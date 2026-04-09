const Contest = require('../models/Contest');
const User = require('../models/User');
const mongoose = require('mongoose');

// Check database connection
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// @desc Get all contests
// @route GET /api/contests
// @access Public
const getAllContests = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const contests = await Contest.find()
      .populate('createdBy', 'name email')
      .populate('entries.userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(contests);
  } catch (error) {
    console.error('Error fetching contests:', error.message);
    res.status(500).json({ message: 'Failed to fetch contests' });
  }
};

// @desc Get contest by ID
// @route GET /api/contests/:id
// @access Public
const getContestById = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('entries.userId', 'name email');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    res.json(contest);
  } catch (error) {
    console.error('Error fetching contest:', error.message);
    res.status(500).json({ message: 'Failed to fetch contest' });
  }
};

// @desc Create contest
// @route POST /api/contests
// @access Private
const createContest = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { title, theme, category, gender, budget } = req.body;

    if (!title || !theme || !category || !gender || !budget) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }

    const contest = await Contest.create({
      title,
      theme,
      category,
      gender,
      budget: Number(budget),
      createdBy: req.user._id,
      entries: [],
      votes: []
    });

    const populatedContest = await contest.populate('createdBy', 'name email');

    res.status(201).json(populatedContest);
  } catch (error) {
    console.error('Error creating contest:', error.message);
    res.status(500).json({ message: 'Failed to create contest' });
  }
};

// @desc Submit entry to contest
// @route POST /api/contests/:id/entries
// @access Private
const submitEntry = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { image, productLinks } = req.body;

    if (!image || !productLinks) {
      return res.status(400).json({ message: 'Please provide image and product links' });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if user already submitted
    const existingEntry = contest.entries.find(
      e => e.userId.toString() === req.user._id.toString()
    );

    if (existingEntry) {
      return res.status(400).json({ message: 'You have already submitted an entry to this contest' });
    }

    const entry = {
      userId: req.user._id,
      username: req.user.name,
      image,
      productLinks: Array.isArray(productLinks) ? productLinks : productLinks.split(',').map(link => link.trim()),
      votes: 0
    };

    contest.entries.push(entry);
    await contest.save();

    const updatedContest = await contest.populate('entries.userId', 'name email');

    res.status(201).json({
      message: 'Entry submitted successfully',
      contest: updatedContest
    });
  } catch (error) {
    console.error('Error submitting entry:', error.message);
    res.status(500).json({ message: 'Failed to submit entry' });
  }
};

// @desc Vote for entry
// @route POST /api/contests/:id/vote
// @access Private
const voteForEntry = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { id } = req.params;
    const { entryIndex } = req.body;

    if (entryIndex === undefined) {
      return res.status(400).json({ message: 'Please provide entry index' });
    }

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Check if user already voted for this entry
    const alreadyVoted = contest.votes.find(
      v => v.userId.toString() === req.user._id.toString() && 
           v.entryId === entryIndex
    );

    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted for this entry' });
    }

    // Increment vote count for entry
    if (contest.entries[entryIndex]) {
      contest.entries[entryIndex].votes = (contest.entries[entryIndex].votes || 0) + 1;
    }

    // Record the vote
    contest.votes.push({
      userId: req.user._id,
      entryId: entryIndex
    });

    await contest.save();

    const updatedContest = await contest.populate('entries.userId', 'name email');

    res.json({
      message: 'Vote recorded successfully',
      contest: updatedContest
    });
  } catch (error) {
    console.error('Error voting:', error.message);
    res.status(500).json({ message: 'Failed to vote' });
  }
};

// @desc Get leaderboard for contest
// @route GET /api/contests/:id/leaderboard
// @access Public
const getLeaderboard = async (req, res) => {
  try {
    if (!isDBConnected()) {
      return res
        .status(503)
        .json({ message: 'Database not connected. Please try again later.' });
    }

    const contest = await Contest.findById(req.params.id)
      .populate('entries.userId', 'name email');

    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    // Sort entries by votes
    const leaderboard = contest.entries.sort((a, b) => b.votes - a.votes);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    res.status(500).json({ message: 'Failed to fetch leaderboard' });
  }
};

module.exports = {
  getAllContests,
  getContestById,
  createContest,
  submitEntry,
  voteForEntry,
  getLeaderboard
};
