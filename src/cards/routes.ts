import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import CardController from "./cards-controller";
// import { userSchema, noteSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const cardController = new CardController(serverConfigs, database);
    server.bind(cardController);

    server.route({
        method: 'PUT',
        path: '/cards/{cardId}/favourite',
        handler: cardController.favCard,
        config: {
            description: 'Will be used by a user to Favourite/Un-faviourite a card',
            // auth: 'jwt',
            validate: {
                params: {
                    cardId: Joi.number().required(),
                }
            },
            response: {},
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully changed the favourite state of card'
                        },
                        '401': {
                            'description': 'User un-authorised'
                        },
                        '404': {
                            'description': 'Card not found'
                        }
                    }
                }
            },
            tags: ['api','cards'],
        }
    });

    server.route({
        method: 'GET',
        path: '/cards/favourite',
        handler: cardController.getFavouriteCards,
        // auth: 'jwt',        
        config: {
            description: 'GET all the cards marked as favourite by a user',
            response: {},
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully returned the favourite cards if any.'
                        }
                    }
                }
            },
            tags: ['api','cards'],
        }
    });

     server.route({
        method: 'GET',
        path: '/cards/upload',
        handler: cardController.upload,
        // auth: 'jwt',        
        config: {
            description: 'Uploading a card',
            response: {},
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully returned the favourite cards if any.'
                        }
                    }
                }
            },
            tags: ['api','admin'],
        }
    });
}
