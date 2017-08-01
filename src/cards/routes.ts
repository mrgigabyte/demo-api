import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../config";
import * as Boom from "boom";

import CardController from "./cards-controller";
import { cardSchema } from "./schemas";

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
        path: '/card/{cardId}/addLink',
        handler: cardController.addLink,
        config: {
            description: 'Add link to a card which can be of type basic or video.',
            notes: `
            GOD and JESUS can access this endpoint`,
            auth: 'jwt',
            validate: {
                params: {
                    cardId: Joi.number()
                        .required()
                        .description('the card id'),
                },
                payload: {
                    link: Joi.string().uri().required()
                        .description('Link to be assosciated witht a card.')
                }
            },
            response: {
                schema: Joi.object({
                    "added": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully added the link to the card.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin'],
        }
    });

    server.route({
        method: 'DELETE',
        path: '/card/{cardId}',
        handler: cardController.deleteCard,
        config: {
            description: 'Delete the card.',
            notes: `It will soft delete the card.  
            
            GOD and JESUS can access this endpoint`,
            auth: 'jwt',
            validate: {
                params: {
                    cardId: Joi.number()
                        .required()
                        .description('the card id'),
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
                            'description': 'Successfully deleted the card.'
                        }
                    }
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin'],
        }
    });
}
