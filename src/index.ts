import * as Server from "./server";
import * as Configs from "./config";
import database from './models';

console.log(`Running enviroment ${process.env.NODE_ENV || "dev"}`);

const serverConfigs = Configs.getServerConfigs();
console.log(database);
//Starting Application Server
const server = Server.init(serverConfigs, database).then((server) => {

    if (!module.parent) {
        server.start(() => {
            console.log('Server running at:', server.info.uri);
            // console.log('Documentaion available at:', server.info.uri + '/docs');
        });
        console.log("Running server from parent :)");
    } else {
        console.log("Not running the server because it is not run through parent module.");
    }
});
