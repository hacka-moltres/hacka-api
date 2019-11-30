import * as Joi from 'joi';

export const schema = Joi.object().required().keys({
  sessionId: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  email: Joi.string().required().allow(null),
  phone: Joi.string().required().allow(null),
});
