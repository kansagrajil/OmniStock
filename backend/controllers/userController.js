const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        // Add "isNew" flag to each user
        const usersWithStatus = users.map(user => {
            const joinedDate = new Date(user.createdAt);
            const now = new Date();
            const hoursSinceJoined = (now - joinedDate) / (1000 * 60 * 60);

            return {
                ...user.toObject(),
                isNewUser: hoursSinceJoined <= 24
            };
        });

        res.json(usersWithStatus);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers
};
