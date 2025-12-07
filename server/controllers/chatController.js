import ChatMessage from '../models/ChatMessage.js';

// @desc    Get chat messages between two users
// @route   GET /api/chat/:userId
// @access  Private
export const getChatMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const messages = await ChatMessage.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
    })
      .populate('sender receiver', 'name profilePicture')
      .populate('property', 'title images')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all conversations for current user
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get unique users the current user has chatted with
    const conversations = await ChatMessage.aggregate([
      {
        $match: {
          $or: [{ sender: currentUserId }, { receiver: currentUserId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$seen', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          user: {
            _id: 1,
            name: 1,
            email: 1,
            profilePicture: 1,
            role: 1,
          },
          lastMessage: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark messages as seen
// @route   PUT /api/chat/:userId/seen
// @access  Private
export const markMessagesAsSeen = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await ChatMessage.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        seen: false,
      },
      {
        seen: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as seen',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
