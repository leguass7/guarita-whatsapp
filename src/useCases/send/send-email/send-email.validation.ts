import { celebrate, Joi, Segments } from 'celebrate';

export const getSendNowSchema = celebrate(
  {
    [Segments.QUERY]: {
      day: Joi.string().allow(''),
    },
  },
  { abortEarly: true, stripUnknown: true },
);
