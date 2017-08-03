import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../config";
import * as Boom from "boom";

import CardController from "./cards-controller";
import { cardSchema, baseCardSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const cardController = new CardController(serverConfigs, database);
    server.bind(cardController);

    server.route({
        method: 'POST',
        path: '/card/{cardId}/favourite',
        handler: cardController.favourite,
        config: {
            description: 'Favourite/Un-faviourite a card',
            notes: `
            GOD, JESUS and ROMANS can access this endpoint`,
            auth: 'jwt',
            validate: {
                params: {
                    cardId: Joi.number()
                        .required()
                        .description('the card id'),
                }
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
                            'description': 'Successfully changed the favourite state of card'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'card'],
        }
    });

    server.route({
        method: 'GET',
        path: '/card/favourite',
        handler: cardController.getFavouriteCards,
        config: {
            description: 'GET all the cards marked as favourite by a user',
            notes: `
            GOD, JESUS and ROMANS can access this endpoint`,
            auth: 'jwt',
            response: {
                schema: Joi.object({
                    "data": Joi.array().items(cardSchema)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully returned the favourite cards if any.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'card'],
        }
    });
    server.route({
        method: 'POST',
        path: '/card/upload',
        handler: cardController.uploadCard,
        config: {
            description: 'Upload a new card from the file system to google cloud storage.',
            notes: `You can upload an image(.png, .jpg, .gif) or a video(.mp4).  
            After successfull upload it will return the card details.
            File size is limited to a max of 100 MBs.

            GOD and JESUS can access this endpoint
            `,
            auth: 'jwt',
            payload: {
                output: 'stream',
                parse: true,
                maxBytes: 102400000,
                allow: 'multipart/form-data',
            },
            validate: {
                payload: {
                    file: Joi.any().required()
                        .meta({ swaggerType: 'file' })
                        .description('The file which needs to be uploaded.')
                }
            },
            response: {
                schema: Joi.object({
                    "link": Joi.string().uri().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: {
                        '201': {
                            'description': 'Successfully uploaded the card and returned the uri.'
                        },
                        '403': {
                            'description': 'file type not supported'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin'],
        }
    });
}
