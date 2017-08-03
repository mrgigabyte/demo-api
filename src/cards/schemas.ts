import * as Joi from "joi";

export const baseCardSchema: Joi.ObjectSchema = Joi.object({
    mediaUri: Joi.string().uri().required(),
    mediaType: Joi.string().valid(['image', 'video']).required(),
    externalLink: Joi.string().uri().allow(null)
});

export const cardSchema: Joi.ObjectSchema = baseCardSchema.keys({
    id: Joi.number().required(),
    order: Joi.number().required(),    
    createdAt: Joi.date().required(),
    updatedAt: Joi.date().required(),
    storyId: Joi.number().required()                                
});

export const cardSchemaWithOptionalId: Joi.ObjectSchema = baseCardSchema.keys({
    id: Joi.number()
});


// TODO: Should we pass the deleted key in cards which are not saved yet.
// To save the details of the cards that have been not uploaded.