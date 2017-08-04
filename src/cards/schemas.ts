import * as Joi from "joi";

export const baseCardSchema: Joi.ObjectSchema = Joi.object({
    order: Joi.number().required(),
    mediaUri: Joi.string().required(),
    mediaType: Joi.string().valid(['image', 'video']).required(),
    externalLink: Joi.string().uri().allow(null).optional()
});

export const cardSchema: Joi.ObjectSchema = baseCardSchema.keys({
    id: Joi.number().required()        
});

