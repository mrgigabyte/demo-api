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
        path: '/user/admin/login',
        handler: userController.adminLogin,
        config: {
            description: 'Admin User Login',
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
            tags: ['api','admin'],
        }
    });

     server.route({
        method: 'POST',
        path: '/user/admin/reset',
        handler: userController.adminReset,
        config: {
            description: 'Resetting the Password for Admin User',
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
            tags: ['api','admin'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/login',
        handler: userController.login,
        config: {
            description: 'Normal User Login',
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
            tags: ['api','user'],
        }
    });

     server.route({
        method: 'POST',
        path: '/user/reset',
        handler: userController.reset,
        config: {
            description: 'Normal User Password-Reset',
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
            tags: ['api','user'],
        }
    });

     server.route({
        method: 'POST',
        path: '/user/signup',
        handler: userController.signUp,
        config: {
            description: 'Normal User Sign-Up',
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
            tags: ['api','user'],
        }
    });

     server.route({
        method: 'GET',
        path: '/user/profile',
        handler: userController.profileGet,
        config: {description: 'GET details of the current user account',
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
            tags: ['api','user']}
        });

    server.route({
        method: 'GET',
        path: '/user',
        handler: userController.profileGet,
        config: {description: 'GET details of all the users',
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
            tags: ['api','user']}
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
            tags: ['api','user'],
        }
    });

    server.route({
        method: 'PUT',
        path: '/user/emailnotif',
        handler: userController.emailNotif,
        config: {
            description: 'setting email notifications (in the hamburger menu)',
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
            tags: ['api','user'],
        }
    });

     server.route({
        method: 'PUT',
        path: '/user/profile',
        handler: userController.profileUpdate,
        config: {
            description: 'Updating the CURRENT user profile',
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
            tags: ['api','user'],
        }

   });
   
    server.route({
        method: 'DELETE',
        path: '/user/profile',
        handler: userController.profileDelete,
        config: {
            description: 'Deleting the CURRENT user profile',
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
            tags: ['api','user'],
        }
    });
    
}
