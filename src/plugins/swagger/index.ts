import { IPlugin, IPluginInfo } from "../interfaces";
import * as Hapi from "hapi";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server): Promise<any> => {
            return new Promise<void>(resolve => {
                server.register([
                    require('inert'),
                    require('vision'),
                    {
                        register: require('hapi-swagger'),
                        options: {
                            documentationPage: false,
                            info: {
                                title: 'Abstract Api',
                                description: 'API for abstract',
                                version: '1.0.0'
                            },
                            securityDefinitions: {
                                'jwt': {
                                    'type': 'apiKey',
                                    'name': 'Authorization',
                                    'in': 'header'
                                }
                            },
                            grouping: 'tags',
                            tags: [
                                {
                                    'name': 'user'
                                },
                                {
                                    'name': 'story'

                                },
                                {
                                    'name': 'cards'
                                },
                                {
                                    'name': 'admin',
                                    'description': 'Endpoints for the admin panel.',
                                },
                            ],
                            jsonEditor: true,
                            validatorUrl: null,
                        }
                    }
                    
                ]
                    , (error) => {
                        if (error) {
                            console.log('error', error);
                        }
                        resolve();
                    });
            });
        },
        info: () => {
            return {
                name: "Swagger Documentation",
                version: "1.0.0"
            };
        }
    };
};
