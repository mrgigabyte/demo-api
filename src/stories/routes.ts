import * as Hapi from "hapi";
import * as Joi from "joi";
import * as Boom from "boom";

import { IServerConfigurations } from "../config";
import StoryController from "./stories-controller";
import { storySchema, newStorySchema, updateStorySchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const storyController = new StoryController(serverConfigs, database);
    server.bind(storyController);

    server.route({
        method: 'GET',
        path: '/story/latest',
        handler: storyController.getLatest,
        config: {
            description: 'Returns latest stories for the user',
            notes: `This endpoint will return at max 2 most recent unread sotries from chronologically sorted list of published stories.

            GOD, JESUS and ROMANS can access this endpoint.
            `,
            auth: 'jwt',
            validate: {
            },
            response: {
                schema: Joi.object({
                    "latest": Joi.array().items(storySchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'successfully returned a list of latest stories.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'story']
        }
    });

    server.route({
        method: 'POST',
        path: '/story/{idOrSlug}/markRead',
        handler: storyController.markRead,
        config: {
            description: 'Marks a story as read when the user swipes through the last card of a story',
            notes: `
            GOD, JESUS and ROMANS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                }
            },
            response: {
                schema: Joi.object({
                    "read": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Read the complete story.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'story']
        }
    });


    server.route({
        method: 'GET',
        path: '/story/archived',
        handler: storyController.getArchived,
        config: {
            description: 'GET all the archived stories',
            notes: `A story will be archived on the basis of the following 2 conditions:     
            1. A user has read(User has swiped through all the cards of a story) the story.  
            2. Stories which are not read by the user and are not latest stories.  

            GOD, JESUS and ROMANS can access this endpoint.`,
            auth: 'jwt',
            response: {
                schema: Joi.object({
                    "archived": Joi.array().items(storySchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'successfully returned a list of archived stories.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'story']
        }
    });

    server.route({
        method: 'GET',
        path: '/story/{idOrSlug}',
        handler: storyController.getStoryByIdOrSlug,
        config: {
            description: 'GET story details by Id or Slug',
            notes: `
            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
            },
            response: {
                schema: Joi.object({
                    "story": storySchema
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Details of the story with id/slug in the payload found.'
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
        path: '/story',
        handler: storyController.getAllStories,
        config: {
            description: 'GET all the stories(published/drafts) created so far.',
            notes: `The stories can be of the following two types:  
            1. draft : Stories that dont have a publishedOn key.  
            2. published : Stories that have a publishedOn key.
            
            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(storySchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'List of all stories returned successfully'
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
        path: '/story',
        handler: storyController.newStory,
        config: {
            description: 'Creates a new story using the info sent in the payload.',
            notes: `The order of the cards will be decided from the position of cards in the array sent in the payload.
            And, new cards will be created accordingly.

            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                payload: newStorySchema
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
                            'description': 'new story created successfully'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

    server.route({
        method: 'PUT',
        path: '/story/{idOrSlug}',
        handler: storyController.updateStory,
        config: {
            description: 'Update details of a previously published/draft story.',
            notes: `This endpoint can to the following things  :

            1) Update title and by of a story.
            2) Add new cards (cards without id).
            3) Update details of existing cards(cards with id).
            4) Delete old cards (cards not a part of request payload).

            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
                payload: updateStorySchema
            },
            response: {
                schema: Joi.object({
                    "updated": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': 'Successfully made the changes.'
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

    server.route({
        method: 'POST',
        path: '/story/{idOrSlug}/pushLive',
        handler: storyController.pushLive,
        config: {
            description: "Makes a story live.",
            notes: `This endpoint will publish a story to the platform and 
            will make it available to be read by the users who haven't read the story before.
            
            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
            },
            response: {
                schema: Joi.object({
                    "pushed": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'successfully published the story.'
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
        path: '/story/{idOrSlug}/preview',
        handler: storyController.preview,
        config: {
            description: 'Makes the story live only for GOD and JESUS.',
            notes: `This will make a story live only for GOD and JESUS.
            
            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
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
                            'description': 'successfully made the story live only for GOD/JESUS.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

    server.route({
        method: 'DELETE',
        path: '/story/{idOrSlug}',
        handler: storyController.deleteStory,
        config: {
            description: 'Deletes the story.',
            notes: `It will soft delete a story. 
            
            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
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
                            'description': 'successfully deleted the story.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });
}
