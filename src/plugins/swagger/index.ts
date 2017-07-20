import {IPlugin, IPluginInfo} from "../interfaces";
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
                            info: {
                                title: 'abstr_ct API',
                                description: 'API powering the the abstr_ct platform :)',
                                version: '0.1'
                            },
                            securityDefinitions: {
                                'jwt': {
                                    'type': 'apikey',
                                    'name': 'Authorization',
                                    'in': 'header'
                                }
                            },
                            tags: [
                                {
                                    'name': 'users'
                                },
                                {
                                    'name': 'stories'
                                },
                                {
                                    'name': 'cards'
                                }
                            ],
                            documentationPage: true,
                            documentationPath: '/docs'
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
