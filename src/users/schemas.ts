import * as Joi from "joi";

export const userSchemaWithOptionalKeys: Joi.ObjectSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    emailNotif: Joi.boolean(),
    pushNotif: Joi.string()
        .valid(['disable', 'morning', 'afternoon', 'night'])
});

export const userSchema: Joi.ObjectSchema = Joi.object({
    id: Joi.number().required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    emailNotif: Joi.boolean().required(),
    pushNotif: Joi.string().required()
        .valid(['disable', 'morning', 'afternoon', 'night']),
    joinedOn: Joi.date().required()
});


export const userAdminPannelSchema: Joi.ObjectSchema = userSchema.keys({
    status: Joi.string().required()
        .valid(['active', 'inactive', 'deleted']),
});


