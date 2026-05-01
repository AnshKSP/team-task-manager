const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);
