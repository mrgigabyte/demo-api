import * as Joi from "joi";
import { baseCardSchema, cardSchema } from "../cards/schemas";

export const baseStorySchema:Joi.ObjectSchema = Joi.object({
    title: Joi.string().required(),
    by: Joi.string().required(),
    cards: Joi.array().items(baseCardSchema)
});

export const storySchema:Joi.ObjectSchema = baseStorySchema.keys({
    id: Joi.number().required(),
    slug: Joi.string().required(),
    by: Joi.string(),
    views: Joi.number(),
    publishedAt: Joi.any(),
    createdAt: Joi.date().required(),
    // users: Joi.array().items(Joi.number())
    users: Joi.any()
});

    