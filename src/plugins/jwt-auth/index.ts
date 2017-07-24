import { IPlugin, IPluginOptions } from "../interfaces";
import * as Hapi from "hapi";
// import { IUser, UserModel } from "../../users/user";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server, options: IPluginOptions): Promise<void>  => {
            return new Promise<void>(resolve => {
                const database = options.database;
                const serverConfig = options.serverConfigs;

                const validateUser = (decoded, request: Hapi.Request, cb) => {
                    server.app.userId = decoded.id;
                    console.log(decoded);
                    return cb(null, true, {role:['SUPER-ADMIN']});
                };

                server.register({
                    register: require('hapi-auth-jwt2')
                }, (error) => {
                    if (error) {
                        console.log('error', error);
                    } else {
                        server.auth.strategy('jwt', 'jwt', false,
                            {
                                key: "secret",
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


// var validate = function (decoded, request, callback) {

//     // do your checks to see if the person is valid
//     if (!people[decoded.id]) {
//       return callback(null, false);
//     }
//     else {
//       return callback(null, true);
//     }
// };