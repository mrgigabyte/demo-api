import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "./configurations";
import * as Boom from "boom";

import StoryController from "./stories-controller";
// import { userSchema, noteSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const storyController = new StoryController(serverConfigs, database);
    server.bind(storyController);

    server.route({
        method: 'GET',
        path: '/stories/latest',
        handler: storyController.latest,
        config: {
                    description: 'GET all the latest stories for the user',
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
                    tags: ['api','stories']
                }
        });

     server.route({
        method: 'GET',
        path: '/stories/archived',
        handler: storyController.archived,
        config: {
                    description: 'GET all the archived stories',
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
                    tags: ['api','stories']
                }
        });

server.route({
        method: 'GET',
        path: '/stories',
        handler: storyController.getStories,
        config: {
                    description: 'GET all the stories created so far',
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
                    tags: ['api','admin']
                }
        });

     server.route({
        method: 'POST',
        path: '/stories/save',
        handler: storyController.saveStory,
        config: {
                    description: 'SAVING the story (creates a new storyId)',
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
                    tags: ['api','admin']
                }
        });

server.route({
        method: 'PUT',
        path: '/stories/{storyId}',
        handler: storyController.updateStory,
        config: {
                    description: 'UPDATES the changes to the current story',
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
                    tags: ['api','admin']
                }
        });

     server.route({
        method: 'POST',
        path: '/stories/{storyId}/pushLive',
        handler: storyController.pushLive,
        config: {
                    description: 'PUSHES the new story created (makes it live for all)',
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
                    tags: ['api','admin']
                }
        });

    server.route({
        method: 'POST',
        path: '/stories/{storyId}/preview',
        handler: storyController.preview,
        config: {
                    description: 'PUSHES the new story created (for preview)',
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
                    tags: ['api','admin']
                }
        });


}
