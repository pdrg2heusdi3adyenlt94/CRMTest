const express = require('express');
const router = express.Router();
const { 
  getInteractions, 
  getInteractionById, 
  createInteraction, 
  updateInteraction, 
  deleteInteraction 
} = require('../controllers/interactionController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.route('/')
  .get(protect, getInteractions)
  .post(protect, createInteraction);

router.route('/:id')
  .get(protect, getInteractionById)
  .put(protect, updateInteraction)
  .delete(protect, deleteInteraction);

module.exports = router;