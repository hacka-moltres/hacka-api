import * as Joi from 'joi';

export const search = Joi.object().required().keys({
  search: Joi.string().required().min(4),
});
