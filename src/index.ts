import * as Server from "./server";
import * as Configs from "./config";
import * as Hapi from "hapi";
import * as Database from './models';

try {
    if (process.env.NODE_ENV) {
        let database = Database.init(process.env.NODE_ENV);
        console.log(`Running enviroment ${process.env.NODE_ENV}`);
        const serverConfigs = Configs.getServerConfigs();
        database.sequelize.sync().then(() => {
            //Starting Application Server
            Server.init(serverConfigs, database).then((server: Hapi.Server) => {
                server.start(() => {
                    console.log('Server running at:', server.info.uri);
                });
            });
        });
    } else {
        throw Error('Set NODE_ENV to "dev", "prod" or "local".');
    }
} catch (error) {
    console.log(error);
}