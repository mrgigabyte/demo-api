import { IPlugin, IPluginOptions } from "../interfaces";
import * as Hapi from "hapi";
// import { IUser, UserModel } from "../../users/user";

export default (): IPlugin => {
    return {
        register: (server: Hapi.Server, options: IPluginOptions): Promise<void>  => {
            return new Promise<void>(resolve => {
                const database = options.database;
                const serverConfig = options.serverConfigs;

                server.register({
                    register: require('hapi-authorization'),
                    options: {
                        roles: false
                    }
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
                name: "ACL :D",
                version: "1.0.0"
            };
        }
    };
};