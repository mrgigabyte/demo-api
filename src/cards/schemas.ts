import * as Joi from "joi";

export const baseCardSchema: Joi.ObjectSchema = Joi.object({
    id: Joi.number().required(),    
    order: Joi.number().required(),
    mediaUri: Joi.string().uri().required(),
    mediaType: Joi.string().valid(['image', 'video']).required(),
    externalLink: Joi.string().uri(),
});

export const cardSchema: Joi.ObjectSchema = baseCardSchema.keys({
    favourite: Joi.boolean().required()
});

