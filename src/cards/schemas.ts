import * as Joi from "joi";


export const cardSchema: Joi.ObjectSchema = Joi.object({
    mediaUri: Joi.string().uri().required(),
    mediaType: Joi.string().valid(['image', 'video']).required(),
    externalLink: Joi.string().uri().allow(null),
    id: Joi.number()                                
});

