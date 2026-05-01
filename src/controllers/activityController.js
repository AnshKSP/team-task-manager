const ActivityLog = require('../models/ActivityLog');

exports.getActivities = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find()
      .populate('user', 'name avatar role')
      .populate('project', 'title')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(50);
      
    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    next(error);
  }
};
