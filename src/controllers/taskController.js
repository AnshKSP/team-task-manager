const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
exports.getTasks = asyncHandler(async (req, res, next) => {
  // First, find all projects this user owns or is a member of
  const userProjects = await Project.find({
    $or: [
      { createdBy: req.user.id },
      { members: req.user.id }
    ]
  }).select('_id');

  const projectIds = userProjects.map(p => p._id);

  // Then find all tasks in those projects
  const tasks = await Task.find({
    project: { $in: projectIds }
  }).populate('project', 'title').populate('assignedTo', 'name');

  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// @desc    Get tasks for a specific project
// @route   GET /api/projects/:projectId/tasks
// @access  Private
exports.getProjectTasks = asyncHandler(async (req, res, next) => {
    const project = await Project.findById(req.params.projectId);
    
    if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.createdBy.toString() !== req.user.id && !project.members.some(m => m.toString() === req.user.id)) {
        return res.status(403).json({ success: false, error: 'Not authorized to access this project' });
    }

    const tasks = await Task.find({ project: req.params.projectId })
        .populate('assignedTo', 'name email avatar')
        .populate('progressUpdates.user', 'name');

    res.status(200).json({
        success: true,
        count: tasks.length,
        data: tasks
    });
});


// @desc    Create new task
// @route   POST /api/projects/:projectId/tasks
// @access  Private (Admin only)
exports.createTask = asyncHandler(async (req, res, next) => {
  req.body.project = req.params.projectId;

  const project = await Project.findById(req.params.projectId);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Make sure user is project owner
  if (project.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, error: 'User not authorized to add a task to this project' });
  }

  const task = await Task.create(req.body);

  await ActivityLog.create({
    user: req.user.id,
    action: 'CREATED_TASK',
    details: `Created task: ${task.title}`,
    project: project._id,
    task: task._id
  });

  req.app.get('io').emit('notification', {
    type: 'success',
    message: `New task created: ${task.title}`,
    project: task.project
  });
  req.app.get('io').emit('taskCreated', task);

  res.status(201).json({
    success: true,
    data: task
  });
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private (Admin or Assigned Member)
exports.updateTaskStatus = asyncHandler(async (req, res, next) => {
  let task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const project = await Project.findById(task.project);

  // Allow project owner or assigned member to update status
  if (project.createdBy.toString() !== req.user.id && task.assignedTo?.toString() !== req.user.id && !project.members.some(m => m.toString() === req.user.id)) {
    return res.status(403).json({ success: false, error: 'User not authorized to update this task' });
  }

  task.status = req.body.status;
  await task.save();

  await ActivityLog.create({
    user: req.user.id,
    action: 'UPDATED_TASK_STATUS',
    details: `Updated status to ${req.body.status} for task: ${task.title}`,
    project: task.project,
    task: task._id
  });

  req.app.get('io').emit('notification', {
    type: 'success',
    message: `Task status updated to ${req.body.status}`,
    project: task.project
  });
  req.app.get('io').emit('taskUpdated', task);

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private (Admin only)
exports.updateTask = asyncHandler(async (req, res, next) => {
    let task = await Task.findById(req.params.id);
  
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
  
    const project = await Project.findById(task.project);
  
    // Only project owner can update entire task details
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'User not authorized to update this task' });
    }
  
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    await ActivityLog.create({
      user: req.user.id,
      action: 'UPDATED_TASK',
      details: `Updated details for task: ${task.title}`,
      project: task.project,
      task: task._id
    });

    req.app.get('io').emit('notification', {
      type: 'success',
      message: `Task details updated`,
      project: task.project
    });
    req.app.get('io').emit('taskUpdated', task);

    res.status(200).json({
      success: true,
      data: task
    });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin only)
exports.deleteTask = asyncHandler(async (req, res, next) => {
    let task = await Task.findById(req.params.id);
  
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
  
    const project = await Project.findById(task.project);
  
    // Only project owner can delete task
    if (project.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'User not authorized to delete this task' });
    }
  
    await task.deleteOne();
  
    res.status(200).json({
      success: true,
      data: {}
    });
});

// @desc    Add progress update (commit message)
// @route   POST /api/tasks/:id/progress
// @access  Private
exports.addProgressUpdate = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  task.progressUpdates.push({
    message: req.body.message,
    user: req.user.id
  });

  await task.save();

  await ActivityLog.create({
    user: req.user.id,
    action: 'POSTED_UPDATE',
    details: `Posted progress update on task: ${task.title}`,
    project: task.project,
    task: task._id
  });

  req.app.get('io').emit('notification', {
    type: 'success',
    message: `New progress update on task: ${task.title}`,
    project: task.project
  });
  req.app.get('io').emit('taskUpdated', task);

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Request review for task
// @route   PUT /api/tasks/:id/review
// @access  Private
exports.requestReview = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  task.status = 'IN_REVIEW';
  task.reviewStatus = 'PENDING';
  
  if (req.body.message) {
    task.progressUpdates.push({
      message: `REVIEW REQUESTED: ${req.body.message}`,
      user: req.user.id
    });
  }

  await task.save();

  await ActivityLog.create({
    user: req.user.id,
    action: 'REQUESTED_REVIEW',
    details: `Requested review for task: ${task.title}`,
    project: task.project,
    task: task._id
  });

  req.app.get('io').emit('notification', {
    type: 'success',
    message: `Review requested for task: ${task.title}`,
    project: task.project
  });
  req.app.get('io').emit('taskUpdated', task);

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Approve or Request Changes for task
// @route   PUT /api/tasks/:id/approve
// @access  Private (Admin or Project Owner)
exports.approveTask = asyncHandler(async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found' });
  }

  const project = await Project.findById(task.project);

  // Only project owner/admin can approve
  if (project.createdBy.toString() !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, error: 'Only admins or project owners can approve tasks' });
  }

  const { status, message } = req.body; // status: APPROVED or CHANGES_REQUESTED

  task.reviewStatus = status;
  
  if (status === 'APPROVED') {
    task.status = 'DONE';
  } else if (status === 'CHANGES_REQUESTED') {
    task.status = 'IN_PROGRESS';
  }

  if (message) {
    task.progressUpdates.push({
      message: `${status === 'APPROVED' ? 'APPROVED' : 'CHANGES REQUESTED'}: ${message}`,
      user: req.user.id
    });
  }

  await task.save();

  await ActivityLog.create({
    user: req.user.id,
    action: status === 'APPROVED' ? 'APPROVED_TASK' : 'REQUESTED_CHANGES',
    details: `${status === 'APPROVED' ? 'Approved' : 'Requested changes for'} task: ${task.title}`,
    project: task.project,
    task: task._id
  });

  req.app.get('io').emit('notification', {
    type: status === 'APPROVED' ? 'success' : 'error',
    message: `Task ${task.title} was ${status === 'APPROVED' ? 'approved' : 'rejected'}`,
    project: task.project
  });
  req.app.get('io').emit('taskUpdated', task);

  res.status(200).json({
    success: true,
    data: task
  });
});
