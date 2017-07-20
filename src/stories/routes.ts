import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import StoryController from "./stories-controller";
// import { userSchema, noteSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const storyController = new StoryController(serverConfigs, database);
    server.bind(storyController);

    // server.route({
    //     method: 'GET',
    //     path: '/stories/latest',
    //     handler: storyController.latest,
    //     config: {
    //                 description: 'To get the latest stories for the user'
    //             },
    //     response: {
    //             // schema: Joi.object({
    //             //     "user": userSchema,
    //             //     "jwt": Joi.string().required()
    //             //            .default("xxx.yyy.zzz")
    //             //            .description("Will authenticate all the future requests.")
    //             // })
    //         },
    //     plugins: {
    //             'hapi-swagger': {
    //                 responses: {
    //                     '200': {
    //                         'description': 'User already existed and successfully authenticated.'
    //                     },
    //                     '201': {
    //                         'description': 'New user created and successfully authenticated.'
    //                     },
    //                     '401': {
    //                         'description': 'Auth failiure. Wrong ID token.'
    //                     }
    //                 }
    //             }
    //         },
    //         tags: ['api'],
    //     });

    //  server.route({
    //     method: 'GET',
    //     path: '/stories/archived',
    //     handler: storyController.archived,
    //     config: {
    //                 description: 'gives all the archived stories'
    //             },
    //     response: {
    //             // schema: Joi.object({
    //             //     "user": userSchema,
    //             //     "jwt": Joi.string().required()
    //             //            .default("xxx.yyy.zzz")
    //             //            .description("Will authenticate all the future requests.")
    //             // })
    //         },
    //     plugins: {
    //             'hapi-swagger': {
    //                 responses: {
    //                     '200': {
    //                         'description': 'User already existed and successfully authenticated.'
    //                     },
    //                     '201': {
    //                         'description': 'New user created and successfully authenticated.'
    //                     },
    //                     '401': {
    //                         'description': 'Auth failiure. Wrong ID token.'
    //                     }
    //                 }
    //             }
    //         },
    //         tags: ['api'],
    //     });
}
