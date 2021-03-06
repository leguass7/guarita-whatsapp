import { celebrate, Joi, Segments } from 'celebrate';

export const postSendSchema = celebrate(
  {
    [Segments.BODY]: {
      provider: Joi.string().valid('maxbot', 'sacdigital').required().messages({
        'any.required': 'provider requerido',
        'any.only': 'provider deve ser `maxbot`',
      }),
      type: Joi.string().valid('text', 'image').required(),
      to: Joi.string().required(),
      message: Joi.string().required(),
      metaData: Joi.object({
        email: Joi.string().email().optional(),
        userId: Joi.alternatives(Joi.string(), Joi.number()).allow('').optional(),
        userName: Joi.string().allow('').optional(),
        companyName: Joi.string().allow('').optional(),
        forbiddenEmail: Joi.boolean().optional(),
        makeType: Joi.string().valid('fail', 'ok').optional(),
      }).optional(),
    },
  },
  { allowUnknown: true, abortEarly: true, stripUnknown: true },
);
