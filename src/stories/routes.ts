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
                    },
                    order: 2
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
                    },
                    order: 1
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
                    },
                    order: 3
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
                    },
                    order: 12
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });

    server.route({
        method: 'GET',
        path: '/story',
        handler: storyController.getAllPaginatedStories,
        config: {
            description: 'GET all the stories(published/drafts) created so far.',
            notes: `The stories can be of the following two types:  
            1. draft : Stories that have not been published. Hence, there publishedAt key is equal to null.   
            2. published : Stories that have been published. Hence, there publishedAt key is not null.
            
            GOD and JESUS can access this endpoint.`,
            auth: 'jwt',
            validate: {
                query: {
                    page: Joi.number().required(),
                    size: Joi.number().required()
                }
            },
            response: {
                schema: Joi.object({
                    "stories": Joi.array().items(storySchema),
                    "next": Joi.string().uri()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'List of all stories returned successfully'
                        }
                    },
                    order: 13
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
                    },
                    order: 8
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
            notes: `Pass all the cards in the payload that you want to associate with a story.
            The order in which cards are passed in the payload will decide the cards order.
    
            1) When you pass card details without id in the payload a new card will be created with the details.

            2) You can also edit existing cards in the story. The existing cards will have a id associated them.  
            This id is used to update their details.

            3) Any card that was associated with a story will be deleted if that card is not passed in the payload.

            4) You can also update a story's by and title.

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
                    },
                    order: 9
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
                    },
                    order: 10
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
                    },
                    order: 11
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
            notes: `It will delete a story and all the cards associated with a story. 
            
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
                    },
                    order: 14
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });
}
