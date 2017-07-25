import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import UserController from "./user-controller";
import { userSchema, userSchemaWithOptionalKeys, userAdminPannelSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const userController = new UserController(serverConfigs, database);
    server.bind(userController);

    server.route({
        method: 'POST',
        path: '/user',
        handler: userController.signup,
        config: {
            description: 'Create a new account',
            notes: ['Creates a new user account with the details passed in the payload.'],
            validate: {
                payload: Joi.object({
                    name: Joi.string().required()
                        .description("Name of the user"),
                    password: Joi.string().required()
                        .description('Password of the user'),
                    email: Joi.string().email().required()
                        .description('Email of the user')
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '201': {
                            'description': 'New User Created Successfully'
                        },
                        '409': {
                            'description': 'User with the given details already exists'
                        }
                    }
                }
            },
            tags: ['api', 'user'],
        }
    });

    server.route({
        method: 'POST',
        path: '/user/checkEmail',
        handler: userController.checkEmail,
        config: {
            description: 'Checks if a user with the given email already exists',
             notes: ['This enpoint can be used to check whether a user with the given email already exists during the signup process.'],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description('Email of the user')
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'The email has not been registered with the platform before.'
                        },
                        '400': {
                            'description': 'User with the given email already exists'
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
            notes: [`This endpoint returns three tokens, each for diffrent user roles.  
            1. jwtGod : jwt for GOD  
            2. jwtJesus : jwt for JESUS
            3. jwtRomans : jwt for ROMANS`],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Email of the user"),
                    password: Joi.string().required()
                        .description('Password of the user')
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
                            'description': 'Successfully authenticated.'
                        },
                        '401': {
                            'description': 'Email or password is incorrect.'
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
            notes: [`The reset link will contain a unique code as query parameter, 
            this code will be used to check the credibility of the user when he makes a request with the new password.
            `],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Valid EmailId")
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Email with reset link sent successfully'
                        },
                        '400': {
                            'description': 'Cannot send email to the given email address'
                        }
                    }
                }
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
            notes: [`This endpoint will compare the value of unique code in the payload with
            the code at server side and will update the password if the values match.`],
            validate: {
                payload: Joi.object({
                    code: Joi.string().required()
                        .description("Unique Code"),
                    password: Joi.string().required()
                        .description("New Password")
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully changed the password'
                        },
                        '400': {
                            'description': 'Cannot verify the unique code'
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
            description: 'GET user information',
            notes: ['GOD, JESUS and ROMANS can access this endpoint'],
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
                        '200': {
                            'description': 'Successfully found info of the user with the given id.'
                        },
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'user']
        }
    });

    server.route({
        method: 'PUT',
        path: '/user/{userId}',
        handler: userController.updateUserInfo,
        config: {
            description: 'UPDATE user info with the info sent in the payload.',
            notes: [`This endpoint can be used to do the following:    
            1. Enable/disable email notifications on the basis of the **emailNotif** key.     
            2. Set push notifaction preferences of the user on the basis of the **pushNotif** key.  
              1.1. disable : Disables all kind of push notifications.  
              1.2. morning : Notifications will be sent at 6AM in the morning.
              1.3. afternoon : Notifications will sent at 2PM in the afternoon.
              1.4. night : Notifications will sent at 8PM in the night.  
            3. Update name/email/password 
            
            NOTE:  
                * emailNotif and pushNotif keys cannot be sent together in the payload
                * emailNotif and name/email/password keys cannot be sent together in the payload
                * pushNotif and name/email/password keys cannot be sent together in the payload  
            
            GOD, JESUS and ROMANS can access this endpoint`],
            auth: 'jwt',
            validate: {
                payload: userSchemaWithOptionalKeys
                    .without('emailNotif', ['name', 'email', 'password'])
                    .without('pushNotif', ['name', 'email', 'password'])
                    .without('emailNotif', 'pushNotif'),
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
            },
            response: {
                schema: Joi.object({
                    "res": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User info updated successfully.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
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
            notes: ['It will soft delete a users profile', 'GOD, JESUS and ROMANS can access this endpoint'],
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                }
            },
            response: {
                schema: Joi.object({
                    "res": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Users profile successfully deleted.'
                        }

                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'user'],
        }
    });

    // server.route({
    //     method: 'PUT',
    //     path: '/user/{userId}/changePushNotifPref',
    //     handler: userController.pushNotif,
    //     config: {
    //         description: 'Enable/Disable push-notifications for a user',
    //         notes: [`It will set whether to send push notifications or not  on the basis of payload data.  
    //             1. disable ---- disable notifications.  
    //             2. morning ---- send notifications in morning.  
    //             3. afternoon ---- send notifications in afternoon.  
    //             4. night ---- send notifications at night.  
    //         `],
    //         auth: 'jwt',
    //         validate: {
    //             params: {
    //                 userId: Joi.number().required().description("UserId of a user"),
    //             },
    //             payload: Joi.object({
    //                 pushNotif: Joi.string().required()
    //                     .valid(['disable', 'morning', 'afternoon', 'night'])
    //                     .default('morning')
    //             })
    //         },
    //         response: {
    //             schema: Joi.object({
    //                 "res": Joi.boolean().required()
    //             })
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 responses: {
    //                 }
    //             },
    //             'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
    //         },
    //         tags: ['api', 'user'],
    //     }
    // });

    // server.route({
    //     method: 'PUT',
    //     path: '/user/{userId}/changeEmailNotifPref',
    //     handler: userController.emailNotif,
    //     config: {
    //         description: 'Enable/Disable email-notifications for a user',
    //         auth: 'jwt',
    //         validate: {
    //             params: {
    //                 userId: Joi.number().required().description("UserId of a user"),
    //             },
    //             payload: Joi.object({
    //                 emailNotif: Joi.bool().required()
    //                     .default("true")
    //             }),
    //         },
    //         response: {
    //             schema: Joi.object({
    //                 "res": Joi.boolean().required()
    //             })
    //         },
    //         plugins: {
    //             'hapi-swagger': {
    //                 responses: {
    //                 }
    //             },
    //             'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
    //         },
    //         tags: ['api', 'user']
    //     }
    // });

    server.route({
        method: 'GET',
        path: '/user',
        handler: userController.getAllUsers,
        config: {
            description: 'GET details of all the users',
            notes: ['It will return the list of all users (with pagination).', 'GOD and JESUS can access this endpoint.'],
            auth: 'jwt',
            validate: {
            },
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(userAdminPannelSchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'List of all users returned successfully'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

    server.route({
        method: 'GET',
        path: '/user/CSV',
        handler: userController.getAllUsersCsv,
        config: {
            description: 'GET details of all the users in a csv file',
            notes: ['It will give a downloadable link to a csv file containing the list of all users.',
                'GOD and JESUS can access this endpoint'],
            auth: 'jwt',
            validate: {
            },
            response: {
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Downloadable link generated successfully'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

}
