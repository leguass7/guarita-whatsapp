import { celebrate, Joi, Segments } from 'celebrate';

export const postContactSchema = celebrate({
  [Segments.BODY]: {
    // name: Joi.string().required(),
    // email: Joi.string(),
  },
});

export const patchContactSchema = celebrate({
  [Segments.BODY]: {
    // title: Joi.string(),
    // note: Joi.string(),
  },
  [Segments.PARAMS]: {
    contactId: Joi.string()
      .pattern(/^[0-9]+$/)
      .required()
      .messages({
        'any.required': 'id do contato requerido',
        'string.pattern.base': 'id inválido',
      }),
  },
});

export const getContactSchema = celebrate({
  [Segments.PARAMS]: {
    contactId: Joi.string().uuid().required(),
  },
});
