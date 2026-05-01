const express = require('express');
const { getTasks, updateTaskStatus, updateTask, deleteTask, addProgressUpdate, requestReview, approveTask } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks);

router.route('/:id/status').put(updateTaskStatus);
router.route('/:id/progress').post(addProgressUpdate);
router.route('/:id/review').put(requestReview);
router.route('/:id/approve').put(approveTask);

router
  .route('/:id')
  .put(authorize('ADMIN'), updateTask)
  .delete(authorize('ADMIN'), deleteTask);

module.exports = router;
