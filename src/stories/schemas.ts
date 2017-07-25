import * as Joi from "joi";
import { cardSchema } from "../cards/schemas";

export const storySchema:Joi.ObjectSchema = Joi.object({
    id: Joi.number().required(),
    title: Joi.string().required(),
    slug: Joi.string().required(),
    by: Joi.string(),
    views: Joi.number().required(),
    publishedOn: Joi.date(),
    createdOn: Joi.date().required(),
    read: Joi.boolean().required(),
    cardCount: Joi.number().required(),
    cards: Joi.array().items(cardSchema)
});

