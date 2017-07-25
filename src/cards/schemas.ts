import * as Joi from "joi";

export const cardSchema:Joi.ObjectSchema = Joi.object({
    id: Joi.number().required(),
    order: Joi.number().required(),
    cardData: Joi.string().uri().required(),
    cardType: Joi.string().valid(['image', 'video']).required(),
    favourite: Joi.boolean().required(),
    link: Joi.string().uri(),
    linkType: Joi.string().valid(['video', 'basic']).optional(),
});