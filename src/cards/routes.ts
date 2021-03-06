import * as Hapi from "hapi";
import * as Joi from "joi";
import * as Boom from "boom";

import { IServerConfigurations } from "../config";
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
            description: 'Favourite/Un-favourite a card',
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
                    "favourited": Joi.boolean().required()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully changed the favourite state of card'
                        }
                    },
                    order: 1
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
                    "cards": Joi.array().items(cardSchema).options({ stripUnknown: true }).allow(null)
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully returned the favourite cards if any.'
                        }
                    },
                    order: 2
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS', 'ROMANS'] }
            },
            tags: ['api', 'card'],
        }
    });

    server.route({
        method: 'POST',
        path: '/card/mediaUpload',
        handler: cardController.uploadCard,
        config: {
            description: 'Upload a new card from the file system to google cloud storage.',
            notes: `You can upload an image(.png, .jpg, .gif) or a video(.mp4) file.  
            After successfull upload it will return the card details.
            An image doesn't need any processing, therefore the uri will be reutned but 
            in case of a video upload, a jobId will be returned. Pass this jobId to /cards/checkEncodingStatus endpoint to get
            the details of job status. You will have to poll this endpoint to get the url of the encoded video.
            
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
                    "mediaUri": Joi.string().uri(),
                    "jobId": Joi.number(),
                    "mediaType": Joi.string().valid(['image', 'video']).required(),
                    "isQueued": Joi.boolean().required()
                }).without('mediaUri', 'jobId')
            },
            plugins: {
                'hapi-swagger': {
                    payloadType: 'form',
                    responses: {
                        '201': {
                            'description': 'Successfully uploaded the card and returned the uri.'
                        },
                        '202': {
                            'description': 'Started the video transcoding process.'
                        },
                        '400': {
                            'description': 'file type not supported'
                        }
                    },
                    order: 6
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin'],
        }
    });

    server.route({
        method: 'GET',
        path: '/card/checkEncodingStatus',
        handler: cardController.checkEncodingStatus,
        config: {
            description: 'Checks the encoding status of the job whose id is sent in the query params',
            notes: `
            This will return true and uri of the uploaded video on successful transcoding otherwise it will result false.
            GOD and JESUS can access this endpoint
            `,
            auth: 'jwt',
            validate: {
                query: {
                    jobId: Joi.number()
                        .required()
                        .description('JobId of the video whose encoding you want to check')
                }
            },
            response: {
                schema: Joi.object({
                    "encoded": Joi.boolean().required(),
                    "mediaUri": Joi.string()
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'Successfully encoded the video and uploaded to gcs.'
                        },
                        '202': {
                            'description': 'Video is getting encoded.'
                        },
                        '404': {
                            'description': 'No job with the given id'
                        },
                        '417': {
                            'description': 'Could not encode the video.'
                        }
                    },
                    order: 7
                },
                'hapiAuthorization': { roles: ['GOD', 'JESUS'] }
            },
            tags: ['api', 'admin'],
        }
    });
}
