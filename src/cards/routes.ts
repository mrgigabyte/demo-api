import * as Hapi from "hapi";
import * as Joi from "joi";
import { IServerConfigurations } from "../configurations";
import * as Boom from "boom";

import CardController from "./cards-controller";
import { userSchema, noteSchema } from "./schemas";

export default function (server: Hapi.Server, serverConfigs: IServerConfigurations, database: any) {

    const cardController = new CardController(serverConfigs, database);
    server.bind(cardController);

    server.route({
        method: 'PUT',
        path: '/card/{cardId}/favourite',
        handler: cardController.favCard,
        config: {
            description: 'When the user wants to favourite a card',
            auth: 'jwt',
            validate: {
                params: {
                    cardId: Joi.number().required(),
                }
            },
            response: { },
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
        }
    });

     server.route({
        method: 'GET',
        path: '/card/favourite',
        handler: cardController.favourite,
        config: {
            description: 'To get the list of all fav. cards'
            },
        response: {  },
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
    });
}
