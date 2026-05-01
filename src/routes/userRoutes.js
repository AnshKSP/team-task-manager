const express = require('express');
const { getUsers, updateUserRole } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.put('/:id/role', updateUserRole);

module.exports = router;
