const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res, next) => {
  // If user is admin, they might see all projects or only ones they created/are members of.
  // For now, let's show projects where they are createdBy or members.
  const projects = await Project.find({
    $or: [{ createdBy: req.user.id }, { members: req.user.id }]
  }).populate('members', 'name email');

  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email')
    .populate({
      path: 'tasks',
      populate: { path: 'assignedTo', select: 'name email' }
    });

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Check if user is part of the project
  if (project.createdBy.toString() !== req.user.id && !project.members.some(m => m._id.toString() === req.user.id)) {
    return res.status(403).json({ success: false, error: 'Not authorized to access this project' });
  }

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin only)
exports.createProject = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.createdBy = req.user.id;

  // Add creator to members if not already there
  if (req.body.members) {
      if (!req.body.members.includes(req.user.id)) {
          req.body.members.push(req.user.id);
      }
  } else {
      req.body.members = [req.user.id];
  }

  const project = await Project.create(req.body);

  await ActivityLog.create({
    user: req.user.id,
    action: 'CREATED_PROJECT',
    details: `Created project: ${project.title}`,
    project: project._id
  });

  res.status(201).json({
    success: true,
    data: project
  });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin only)
exports.updateProject = asyncHandler(async (req, res, next) => {
  let project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Make sure user is project owner
  if (project.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, error: 'User not authorized to update this project' });
  }

  project = await Project.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  await ActivityLog.create({
    user: req.user.id,
    action: 'UPDATED_PROJECT',
    details: `Updated details for project: ${project.title}`,
    project: project._id
  });

  res.status(200).json({
    success: true,
    data: project
  });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
exports.deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Make sure user is project owner
  if (project.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, error: 'User not authorized to delete this project' });
  }

  await project.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Add member to project by email
// @route   PUT /api/projects/:id/members
// @access  Private (Admin only)
exports.addMember = asyncHandler(async (req, res, next) => {
  const User = require('../models/User');
  const project = await Project.findById(req.params.id);

  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found' });
  }

  // Make sure user is project owner
  if (project.createdBy.toString() !== req.user.id) {
    return res.status(403).json({ success: false, error: 'Only the project owner can add members' });
  }

  // Find user by email
  const userToAdd = await User.findOne({ email: req.body.email });

  if (!userToAdd) {
    return res.status(404).json({ success: false, error: 'No user found with that email' });
  }

  // Check if already a member
  if (project.members.some(m => m.toString() === userToAdd._id.toString())) {
    return res.status(400).json({ success: false, error: 'User is already a member of this project' });
  }

  project.members.push(userToAdd._id);
  await project.save();

  await ActivityLog.create({
    user: req.user.id,
    action: 'ADDED_MEMBER',
    details: `Added member ${userToAdd.email} to project: ${project.title}`,
    project: project._id
  });

  const updatedProject = await Project.findById(req.params.id).populate('members', 'name email');

  res.status(200).json({
    success: true,
    data: updatedProject
  });
});
