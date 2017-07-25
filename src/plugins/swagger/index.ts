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
                            // info: {
                            //     'title': 'Test API Documentation',
                            //     'description': 'This is a sample example of API documentation.',
                            //     'version': Pack.version,
                            //     'termsOfService': 'https://github.com/glennjones/hapi-swagger/',
                            //     'contact': {
                            //         'email': 'glennjonesnet@gmail.com'
                            //     },
                            //     'license': {
                            //         'name': 'MIT',
                            //         'url': 'https://raw.githubusercontent.com/glennjones/hapi-swagger/master/license.txt'
                            //     }
                            // },
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
                                    'name': 'stories'

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
