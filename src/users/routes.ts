import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../config";
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
            notes: `Creates a new user account with the details passed in the payload.  

                No authorisation header required to access this endpoint.`,
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
                    "success": Joi.boolean().required()
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
            notes: `This enpoint can be used to check whether a user with the given email already exists during the signup process.  

                No authorisation header required to access this endpoint.`,
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description('Email of the user')
                })
            },
            response: {
                schema: Joi.object({
                    "valid": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'The email has not been registered with the platform before.'
                        },
                        '409': {
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
            notes: [`This endpoint will return a JWT, generated on the basis of user role that will 
            be used as the value of authorisation for making requests to protected endpoint.
            
            No authorisation header required to access this endpoint.`],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Email of the user"),
                    password: Joi.string().required()
                        .description('Password of the user')
                })
            },
            response: {
                schema: Joi.object({
                    "jwt": Joi.string().required()
                        .description("The api_key that will be used to authenticate all the future requests.")
                })
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
            
            No authorisation header required to access this endpoint.
            `],
            validate: {
                payload: Joi.object({
                    email: Joi.string().email().required()
                        .description("Valid EmailId")
                })
            },
            response: {
                schema: Joi.object({
                    "success": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Email with reset link sent successfully'
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
            notes: `This endpoint will compare the value of unique code in the payload with
            the code at server side and will update the password if the values match.
            
            No authorisation header required to access this endpoint.`,
            validate: {
                payload: Joi.object({
                    code: Joi.string().required()
                        .description("Unique Code"),
                    password: Joi.string().required()
                        .description("New Password"),
                    email: Joi.string().email().required()
                        .description("Your Email")
                })
            },
            response: {
                schema: Joi.object({
                    "reset": Joi.boolean().required()
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
            notes: `  
            GOD, JESUS and ROMANS can access this endpoints`,
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
                        }
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
            notes: `This endpoint can Update name/email/password of a user with the key values sent in the payload.  

            GOD, JESUS and ROMANS can access this endpoint`,
            auth: 'jwt',
            validate: {
                payload: userSchemaWithOptionalKeys,
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
            },
            response: {
                schema: Joi.object({
                    "updated": Joi.boolean().required()
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
            notes: `It will soft delete a users profile  

            GOD, JESUS and ROMANS can access this endpoint`,
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                }
            },
            response: {
                schema: Joi.object({
                    "deleted": Joi.boolean().required()
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

    server.route({
        method: 'PUT',
        path: '/user/{userId}/changePushNotifPref',
        handler: userController.pushNotif,
        config: {
            description: 'Enable/Disable push-notifications for a user',
            notes: ` Set push notifaction preferences of the user on the basis of the pushNotif key in the payload.  
              1. disable : Disables all kind of push notifications.  
              2. morning : Notifications will be sent at 6AM in the morning.
              3. afternoon : Notifications will sent at 2PM in the afternoon.
              4. night : Notifications will sent at 8PM in the night.   

              GOD, JESUS and ROMANS can access this endpoint 
            `,
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
                payload: Joi.object({
                    pushNotif: Joi.string().required()
                        .valid(['disable', 'morning', 'afternoon', 'night'])
                })
            },
            response: {
                schema: Joi.object({
                    "changed": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'PusNotif preference successfully changed.'
                        }
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
            notes: `Enable/disable email notifications on the basis of the emailNotif key in the payload.  

            GOD, JESUS and ROMANS can access this endpoint`,
            auth: 'jwt',
            validate: {
                params: {
                    userId: Joi.number().required().description("UserId of a user"),
                },
                payload: Joi.object({
                    emailNotif: Joi.bool().required()
                }),
            },
            response: {
                schema: Joi.object({
                    "changed": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'EmailNotif preference successfully changed.'
                        }
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
            notes: `It will return the list of all users (with pagination).   

            GOD and JESUS can access this endpoint.`,
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
        method: 'POST',
        path: '/user/createJesus',
        handler: userController.createJesus,
        config: {
            description: 'Create a new account (with Jesus as the role)',
            notes: `Creates a new user account with the details passed in the payload. 

                If incase a user account with the details already exists, then it updates the role of the same.
                
                GOD can access this endpoint.
                Authorisation header is required to access this endpoint.`,
            auth: 'jwt',
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
                    "success": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User promoted to Jesus'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD'] }
            },
            tags: ['api', 'admin']
        }
    });


    server.route({
        method: 'GET',
        path: '/user/getCsvLink',
        handler: userController.generateCsvLink,
        config: {
            description: 'Returns a link which will be used to download the csv file.',
            notes: `It will give a downloadable link to a csv file containing the list of all users.  
            This link will have a jwt in its query parameters which will be used to verify the authenticity of the link.  

            GOD and JESUS can access this endpoint`,
            auth: 'jwt',
            response: {
                schema: Joi.object({
                    "link": Joi.string().uri().required()
                })
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

    server.route({
        method: 'GET',
        path: '/user/downloadCsv',
        handler: userController.downloadCsv,
        config: {
            description: 'Download the csv file containing list of all users.',
            notes: `This endpoint doesn't need any authentication headers.  
            It will verify the credibility of the link by checking the expiry time of the JWT.  

            No authorisation header required to access this endpoint.`,
            validate: {
                query: {
                    jwt: Joi.string().required()
                }
            },
            response: {
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'CSV Download successfully'
                        },
                        '400': {
                            'description': 'JWT has expired'
                        }
                    }
                }
            },
            tags: ['api', 'admin']
        }
    });

}
