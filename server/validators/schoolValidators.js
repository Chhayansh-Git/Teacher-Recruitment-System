// server/validators/schoolValidator.js

import Joi from 'joi';

export const schoolSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  affiliationNo: Joi.string().max(50).required(),
  address: Joi.string().max(500).required(),
  location: Joi.string().max(100).required(),
  pincode: Joi.string().pattern(/^\d{6}$/).required(),
  contactNo: Joi.string().pattern(/^[0-9]{7,15}$/).required(),
  email: Joi.string().email().required(),
  website: Joi.string().uri().allow(''),
  principalName: Joi.string().max(100).optional(),
  directorName: Joi.string().max(100).optional(),
  strength: Joi.number().min(1).required(),
  schoolUpto: Joi.string().valid('V', 'X', 'XII').required(),
  board: Joi.string().valid('CBSE', 'ICSE', 'State', 'IB', 'IGCSE').required(),
  whatsappNumber: Joi.string().pattern(/^[0-9]{7,15}$/).optional(),
  termsAccepted: Joi.boolean().valid(true).required()
});
