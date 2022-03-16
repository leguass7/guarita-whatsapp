import { celebrate, Joi, Segments } from 'celebrate';

export const getSendNowSchema = celebrate(
  {
    [Segments.QUERY]: {
      date: Joi.string().isoDate(),
    },
  },
  { abortEarly: true, stripUnknown: true },
);
