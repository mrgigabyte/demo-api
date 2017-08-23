import { IPlugin } from "../interfaces";
import * as Hapi from "hapi";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server): Promise<any> => {
            return new Promise<void>(resolve => {

                const opts = {
                    reporters: {
                        myConsoleReporter: [{
                            module: 'good-squeeze',
                            name: 'Squeeze',
                            args: [{ error: '*', response: '*', log: '*', request: '*' }]
                        }, {
                            module: 'good-console'
                        }, 'stdout']
                    }
                };

                server.register({
                    register: require('good'),
                    options: opts
                }, (error) => {
                    if (error) {
                        console.log('error', error);
                    }
                    resolve();
                });
            });
        },
        info: () => {
            return {
                name: "Good Logger",
                version: "1.0.0"
            };
        }
    };
};