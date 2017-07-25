import * as Joi from "joi";

export const baseCardSchema: Joi.ObjectSchema = Joi.object({
    order: Joi.number().required(),
    cardData: Joi.string().uri().required(),
    cardType: Joi.string().valid(['image', 'video']).required(),
    link: Joi.string().uri(),
    linkType: Joi.string().valid(['video', 'basic'])
});

export const cardSchema: Joi.ObjectSchema = baseCardSchema.keys({
    id: Joi.number().required(),
    favourite: Joi.boolean().required(),
});

