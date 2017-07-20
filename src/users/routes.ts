import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import UserController from "./user-controller";
import { userSchema, noteSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const userController = new UserController(serverConfigs, database);
    server.bind(userController);

    server.route({
        method: 'POST',
        path: '/login',
        handler: userController.login,
        config: {
            description: 'allows the user to login by validating the credentials passed',
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
                    "user": userSchema,
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
            tags: ['api'],
        }
    });

     server.route({
        method: 'POST',
        path: '/reset',
        handler: userController.reset,
        config: {
            description: 'For resetting the password',
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
                    "user": userSchema,
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
            tags: ['api'],
        }
    });

     server.route({
        method: 'POST',
        path: '/signup',
        handler: userController.singup,
        config: {
            description: 'FOr sign up',
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
                    "user": userSchema,
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
            tags: ['api'],
        }
    });

     server.route({
        method: 'GET',
        path: '/user/profile',
        handler: userController.profileGet,
        config: {description: 'Gives details of the user'},
        response: {
                // schema: Joi.object({
                //     "user": userSchema,
                //     "jwt": Joi.string().required()
                //            .default("xxx.yyy.zzz")
                //            .description("Will authenticate all the future requests.")
                // })
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
            tags: ['api'],
        });

     server.route({
        method: 'PUT',
        path: '/user/pushnotif',
        handler: userController.pushNotif,
        config: {
            description: 'setting push notifications (in the hamburger menu)',
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
                // schema: Joi.object({
                //     "user": userSchema,
                //     "jwt": Joi.string().required()
                //            .default("xxx.yyy.zzz")
                //            .description("Will authenticate all the future requests.")
                // })
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
            tags: ['api'],
        }
    });
     server.route({
        method: 'PUT',
        path: '/user/profile',
        handler: userController.profileUpdate,
        config: {
            description: 'FOr updating the user profile',
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
                // schema: Joi.object({
                //     "user": userSchema,
                //     "jwt": Joi.string().required()
                //            .default("xxx.yyy.zzz")
                //            .description("Will authenticate all the future requests.")
                // })
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
            tags: ['api'],
        }

   });
   
    server.route({
        method: 'DELETE',
        path: '/user/profile',
        handler: userController.profileDelete,
        config: {
            description: 'For deleting the user profile',
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
                // schema: Joi.object({
                //     "user": userSchema,
                //     "jwt": Joi.string().required()
                //            .default("xxx.yyy.zzz")
                //            .description("Will authenticate all the future requests.")
                // })
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
            tags: ['api'],
        }
    });
    
}
