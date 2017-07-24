import { IPlugin, IPluginOptions } from "../interfaces";
import * as Hapi from "hapi";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server, options: IPluginOptions): Promise<void> => {
            return new Promise<void>(resolve => {
                const database = options.database;
                const serverConfig = options.serverConfigs;

                // Add role and userId to the request lifecycle
                const validateUser = (decoded, request: Hapi.Request, cb) => {
                    if (decoded.id && decoded.role) {
                        return cb(null, true, {
                            role: decoded.role,
                            userId: decoded.id
                        });
                    }
                };

                server.register({
                    register: require('hapi-auth-jwt2')
                }, (error) => {
                    if (error) {
                        console.log('error', error);
                    } else {
                        server.auth.strategy('jwt', 'jwt', false,
                            {
                                key: serverConfig.jwtSecret,
                                validateFunc: validateUser,
                                verifyOptions: { algorithms: ['HS256'] }
                            });
                    }
                    resolve();
                });
            });
        },
        info: () => {
            return {
                name: "JWT Authentication",
                version: "1.0.0"
            };
        }
    };
};