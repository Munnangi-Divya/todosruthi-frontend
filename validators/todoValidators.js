const Joi = require('joi');

const createTodoSchema = Joi.object({
  title: Joi.string().min(1).max(150).required(),
  description: Joi.string().allow('', null),
  isCompleted: Joi.boolean().optional()
});

const updateTodoSchema = Joi.object({
  title: Joi.string().min(1).max(150).optional(),
  description: Joi.string().allow('', null).optional(),
  isCompleted: Joi.boolean().optional()
});

module.exports = { createTodoSchema, updateTodoSchema };
