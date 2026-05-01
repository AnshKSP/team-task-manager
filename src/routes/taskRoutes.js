const express = require('express');
const {
  getTasks,
  getProjectTasks,
  createTask,
  updateTaskStatus,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router({ mergeParams: true }); // Important for /api/projects/:projectId/tasks

router.use(protect);

router
  .route('/')
  .get(getProjectTasks)
  .post(authorize('ADMIN'), createTask);

router
  .route('/:id/status')
  .put(updateTaskStatus);

router
  .route('/:id')
  .put(authorize('ADMIN'), updateTask)
  .delete(authorize('ADMIN'), deleteTask);

module.exports = router;
