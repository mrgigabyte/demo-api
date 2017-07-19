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
        method: 'GET',
        path: '/try',
        handler: userController.try
    });
    
    server.route({
        method: 'POST',
        path: '/users/auth/google',
        config: {
            description: 'Get a JWT for a user using his short lived google access token.',
            validate: {
                payload: Joi.object({
                    idToken: Joi.string().required()
                             .description("Short lived access token provided by google web-sign in.")
                             .default("aaa.bbb.ccc")
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
            // handler: 
        }
    });

}
