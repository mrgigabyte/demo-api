import * as Joi from "joi";
import { cardSchema, newCardSchema } from "../cards/schemas";


export const newStorySchema: Joi.ObjectSchema = Joi.object({
    title: Joi.string().required(),
    by: Joi.string().required(),
    cards: Joi.array().items(newCardSchema)
});

export const updateStorySchema: Joi.ObjectSchema = newStorySchema.keys({
    cards: Joi.array().items(cardSchema)
});

export const storySchema: Joi.ObjectSchema = newStorySchema.keys({
    id: Joi.number().required(),
    slug: Joi.string().required(),
    by: Joi.string(),
    views: Joi.number(),
    publishedAt: Joi.date().allow(null),
    createdAt: Joi.date().required(),
    cards: Joi.array().items(cardSchema)
});