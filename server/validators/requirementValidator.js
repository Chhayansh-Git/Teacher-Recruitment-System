// server/validators/requirementValidator.js

import Joi from 'joi';

export const requirementSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  noOfCandidates: Joi.number().min(1).required(),
  subjects: Joi.array().items(Joi.string()).required(),
  posts: Joi.array().items(Joi.string()).required(),
  gender: Joi.string().valid('Male', 'Female', 'Any').required(),
  teachingOrNonTeaching: Joi.string().valid('Teaching', 'Non-Teaching').required(),
  qualification: Joi.string().max(100).required(),
  experience: Joi.number().min(0).required()
});
