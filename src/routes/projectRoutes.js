const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/authMiddleware');

// Include other resource routers
const taskRouter = require('./taskRoutes');

const router = express.Router();

router.use(protect);

// Re-route into other resource routers
router.use('/:projectId/tasks', taskRouter);

router
  .route('/')
  .get(getProjects)
  .post(authorize('ADMIN'), createProject);

router
  .route('/:id')
  .get(getProject)
  .put(authorize('ADMIN'), updateProject)
  .delete(authorize('ADMIN'), deleteProject);

router
  .route('/:id/members')
  .put(authorize('ADMIN'), addMember);

module.exports = router;
