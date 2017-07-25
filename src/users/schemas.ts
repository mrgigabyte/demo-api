import * as Joi from "joi";

export const userSchema: Joi.ObjectSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    emailNotif: Joi.boolean().required(),
    pushNotif: Joi.string().required()
        .valid(['disable', 'morning', 'afternoon', 'night'])
});
