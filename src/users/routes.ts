import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import UserController from "./user-controller";
import { userSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const userController = new UserController(serverConfigs, database);
    server.bind(userController);

    server.route({
        method: 'POST',
        path: '/user',
        handler: userController.signup,
        config: {
            description: 'Create a new account',
            notes: ['Creates a new user account with the details passed in the payload'],
            validate: {
                payload: Joi.object({
                    name: Joi.string().required()
                        .description("Name of the user")
                        .default("John Doe"),
                    password: Joi.string().required()
                        .description('Password of the user')
                        .default('xxxxxxxxxx'),
                    email: Joi.string().email().required()
                        .description('Email of the user')
                        .default('john.doe@gmail.com'),
                    emailNotif: Joi.bool().required()
                        .description('Enable/Disable email notifications')
                        .default('false'),
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'New User Created Successfully'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/login',
        handler: userController.login,
        config: {
            description: 'Returns a JWT for the user after a successfull login',
            notes: ['This endpoint returns three tokens, each for diffrent user roles'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Email of the user")
                        .default("john.doe@gmail.com"),
                    password: Joi.string().required()
                        .description('Password of the user')
                        .default('xxxxxxxxxx')
                })
            },
            response: {
                // schema: Joi.object({
                //     "jwt": Joi.string().required()
                //         .default("xxx.yyy.zzz")
                //         .description("Will authenticate all the future requests.")
                // })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/requestResetPassword',
        handler: userController.requestResetPassword,
        config: {
            description: 'Sends an email to the user with the reset link',
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Valid EmailId")
                        .default("a@a.com")
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/resetPassword',
        handler: userController.resetPassword,
        config: {
            description: 'Resets the password of the user and updates it with the password in the payload',
            validate: {
                payload: Joi.object({
                    password: Joi.string().required()
                        .description("New Password")
                        .default("xxxxxxxxxxxx")
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
            },
            tags: ['api', 'user'],
        }
    });


    server.route({
        method: 'GET',
        path: '/user/{userId}',
        handler: userController.getUserInfo,
        config: {
            description: 'GET user information',
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
            },
            response: {
                schema: Joi.object({
                    "user": userSchema
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
                    }
                }
            },
            tags: ['api', 'user']
        }
    });

    server.route({
        method: 'DELETE',
        path: '/user/{userId}',
        handler: userController.deleteProfile,
        config: {
            description: 'DELETE the profile of the user with the given Id',
            notes: ['It will soft delete a users profile'],
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                }
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {

                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'PUT',
        path: '/user/{userId}/changePushNotifPref',
        handler: userController.pushNotif,
        config: {
            description: 'Enable/Disable push-notifications for a user',
            notes: [`It will set whether to send push notifications or not  on the basis of payload data.  
                1. disable ---- disable notifications.  
                2. morning ---- send notifications in morning.  
                3. afternoon ---- send notifications in afternoon.  
                4. night ---- send notifications at night.  
            `],
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
                payload: Joi.object({
                    pushNotif: Joi.string().required()
                        .valid(['disable', 'morning', 'afternoon', 'night'])
                        .default('morning')
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'PUT',
        path: '/user/{userId}/changeEmailNotifPref',
        handler: userController.emailNotif,
        config: {
            description: 'Enable/Disable email-notifications for a user',
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
                payload: Joi.object({
                    emailNotif: Joi.bool().required()
                        .default("true")
                }),
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'user']
        }
    });

    server.route({
        method: 'GET',
        path: '/user',
        handler: userController.getAllUsers,
        config: {
            description: 'GET details of all the users',
            notes: ['It wil return the list of all users (with pagination).'],
            auth: 'jwt',
            validate: {
            },
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(userSchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {

                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

}
