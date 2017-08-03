import * as Joi from "joi";
import { baseCardSchema, cardSchema, cardSchemaWithOptionalId } from "../cards/schemas";

export const baseStorySchema: Joi.ObjectSchema = Joi.object({
    title: Joi.string().required(),
    by: Joi.string().required(),
    cards: Joi.array().items(baseCardSchema)
});

export const storySchema: Joi.ObjectSchema = baseStorySchema.keys({
    id: Joi.number().required(),
    slug: Joi.string().required(),
    by: Joi.string(),
    views: Joi.number(),
    publishedAt: Joi.date().allow(null),
    createdAt: Joi.date().required(),
    // users: Joi.array().items(Joi.number())
    users: Joi.any(),
    cards: Joi.array().items(cardSchema)
});


export const updateStorySchema: Joi.ObjectSchema = baseStorySchema.keys({
    by: Joi.string(),
    // users: Joi.array().items(Joi.number())
    cards: Joi.array().items(cardSchemaWithOptionalId)
});
