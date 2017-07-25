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
                                title: 'Abstr_ct Api',
                                description: 'API powering the abstr_ct app',
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
                                    'name': 'user',
                                    'description': 'User related enpoints for the app.',
                                },
                                {
                                    'name': 'story',
                                    'description': 'Story related enpoints for the app.',
                                },
                                {
                                    'name': 'card',
                                    'description': 'Card related endpoints for the app.',                                    
                                },
                                {
                                    'name': 'admin',
                                    'description': 'Endpoints for the admin panel.',
                                },
                            ],
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
