const Interaction = require('../models/Interaction');
const { validationResult } = require('express-validator');

const getInteractions = async (req, res) => {
  try {
    const interactions = await Interaction.getAll();
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInteractionById = async (req, res) => {
  try {
    const interaction = await Interaction.getById(req.params.id);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInteraction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const interaction = await Interaction.create(req.body);
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInteraction = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const interaction = await Interaction.update(req.params.id, req.body);
    if (!interaction) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    res.json(interaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteInteraction = async (req, res) => {
  try {
    const success = await Interaction.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Interaction not found' });
    }
    res.json({ message: 'Interaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInteractions,
  getInteractionById,
  createInteraction,
  updateInteraction,
  deleteInteraction
};