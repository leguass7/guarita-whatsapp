import { celebrate, Joi, Segments } from 'celebrate';

// provider: "maxbot"; // apenas maxbot por enquanto
//       contactId: string;
//       type: "text" | "image";
//       message?: string; // sem texto quando for imagem

export const postSendSchema = celebrate(
  {
    [Segments.BODY]: {
      provider: Joi.string().valid('maxbot', 'sacdigital').required().messages({
        'any.required': 'provider requerido',
        'any.only': 'provider deve ser `maxbot`',
      }),
      type: Joi.string().valid('text', 'image').required(),
      // .messages({ 'any.only': 'tipos permitidos `text` e `image` ' }),
      to: Joi.string().required(),
      message: Joi.string().required(),
    },
  },
  { allowUnknown: false, abortEarly: true },
);
