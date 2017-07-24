import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import UserController from "./user-controller";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const userController = new UserController(serverConfigs, database);
    server.bind(userController);

    server.route({
        method: 'POST',
        path: '/user',
        handler: userController.signUp,
        config: {
            description: 'Create a new user account',
            validate: {
                payload: Joi.object({
                    userId: Joi.string().required()
                        .description("Valid userid of the user")
                        .default("abc123"),
                    password: Joi.string().required()
                        .description('password of the user')
                        .default('xxxxxxxxxx')
                })
            },
            response: {
                schema: Joi.object({
                    "jwt": Joi.string().required()
                        .default("xxx.yyy.zzz")
                        .description("Will authenticate all the future requests.")
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'GET',
        path: '/try',
        handler: userController.try,
        config: {
            description: 'test endpoint',
            auth: 'jwt',
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                },
                'hapiAuthorization': { role: 'SUPER-ADMIN' }
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
            validate: {
                payload: Joi.object({
                    userId: Joi.string().required()
                        .description("Valid userid of the user")
                        .default("abc123"),
                    password: Joi.string().required()
                        .description('password of the user')
                        .default('xxxxxxxxxx')
                })
            },
            response: {
                schema: Joi.object({
                    "jwt": Joi.string().required()
                        .default("xxx.yyy.zzz")
                        .description("Will authenticate all the future requests.")
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/{userId}/requestResetPassword',
        handler: userController.reset,
        config: {
            description: 'Sends an email to the with the reset link',
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Valid EmailId")
                        .default("a@a.com")
                })
            },
            response: {
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/{userId}/resetPassword',
        handler: userController.reset,
        config: {
            description: 'Resets the password of the user and updates it with the password in the payload',
            validate: {
                payload: Joi.object({
                    password: Joi.string().required()
                        .description("New Password")
                        .default("xxxxxxxxxxxx")
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });


    server.route({
        method: 'GET',
        path: '/user/{userId}',
        handler: userController.getUserInfo,
        config: {
            description: 'GET details of a user with the give ID',
            validate: {
            },
            response: {
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user']
        }
    });

    server.route({
        method: 'DELETE',
        path: '/user/{userId}',
        handler: userController.profileDelete,
        config: {
            description: 'DELETE the user with the given Id',
            validate: {
            },
            response: {
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'PUT',
        path: '/user/{userId}/changePushNotifPref',
        handler: userController.pushNotif,
        config: {
            description: 'Activate/De-activate push-notifications for a user',
            validate: {
            },
            response: {

            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'PUT',
        path: '/user/{userId}/changeEmailNotifPref',
        handler: userController.emailNotif,
        config: {
            description: 'Activate/De-activate email-notifications for a user',
            validate: {
                payload: Joi.object({
                    emailNotif: Joi.bool().required()
                        .default("true")
                }),
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
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
        validate: {
        },
        response: {
        },
        plugins: {
            'hapi-swagger': {
                responses: {
                    '200': {
                        'description': 'User already existed and successfully authenticated.'
                    },
                    '201': {
                        'description': 'New user created and successfully authenticated.'
                    },
                    '401': {
                        'description': 'Auth failiure. Wrong ID token.'
                    }
                }
            }
        },
        tags: ['api', 'admin']
    }
});

}
