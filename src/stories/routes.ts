import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import StoryController from "./stories-controller";
import { storySchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const storyController = new StoryController(serverConfigs, database);
    server.bind(storyController);

    server.route({
        method: 'GET',
        path: '/story/latest',
        handler: storyController.getLatest,
        config: {
            description: 'GET latest stories for the user',
            notes: ["This endpoint will return those stories that the user has not read from the recently `pushed live stories`.  "
                + "This endpoint will never return more than 2 stories."],
            auth: 'jwt',
            validate: {
            },
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(storySchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                }
            },
            response: {
                schema: Joi.object({
                    "story": storySchema
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            notes: [`Archived stories are those stories which are:  
            1. Read by the user.  
            2. Not read by the user and are older than the latest stories.  `],
            auth: 'jwt',
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(storySchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            notes: ['The stories that dont have a `publishedOn` key are draft stories.'],
            auth: 'jwt',
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(storySchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            auth: 'jwt',
            validate: {
                payload: Joi.object({
                    title: Joi.string()
                        .required()
                        .default('Lorem Ipsum Sit')
                        .description('Story title'),
                    by: Joi.string()
                        .required()
                        .default('John Does')
                        .description('Story Author'),
                    cards: Joi.array().items(Joi.object({
                        order: Joi.number().required(),
                        cardData: Joi.string().uri().required(),
                        cardType: Joi.string().valid(['image', 'video']).required(),
                        link: Joi.string().uri(),
                        linkType: Joi.string().valid(['video', 'basic']),
                    })),
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
                payload: Joi.object({
                    title: Joi.string()
                        .required()
                        .default('Lorem Ipsum Sit')
                        .description('Story title'),
                    by: Joi.string()
                        .required()
                        .default('John Does')
                        .description('Story Author'),
                    cards: Joi.array().items(Joi.object({
                        order: Joi.number().required(),
                        cardData: Joi.string().uri().required(),
                        cardType: Joi.string().valid(['image', 'video']).required(),
                        link: Joi.string().uri(),
                        linkType: Joi.string().valid(['video', 'basic']),
                    })),
                })
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            description: "Makes the story live for all those users who haven't seen the story before",
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            description: 'Makes the story live only for `admin`.',
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
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
            notes: ['It will soft delete a story.'],
            auth: 'jwt',
            validate: {
                params: {
                    idOrSlug: Joi.any().required().description("Id/Slug of the story"),
                },
            },
            response: {
                schema: Joi.object({
                    "res": Joi.string().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin']
        }
    });
}
