import * as Joi from 'joi';

export const schema = Joi.object().required().keys({
  sessionId: Joi.string().required(),
  fingerprint: Joi.string().required(),

  tags: Joi.array().items(Joi.string()),
});
