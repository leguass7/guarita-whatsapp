import { celebrate, Joi, Segments } from 'celebrate';

/**
 * Documentação para regras de validação
 * @see https://joi.dev/api
 */
export const postAuthSchema = celebrate(
  {
    [Segments.BODY]: {
      maxbotToken: Joi.string().allow(''),
    },
  },
  { abortEarly: false, allowUnknown: false },
);
