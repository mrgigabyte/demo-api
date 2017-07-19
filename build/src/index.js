"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Server = require("./server");
const Database = require("./database");
const Configs = require("./configurations");
console.log(`Running enviroment ${process.env.NODE_ENV || "dev"}`);
//Init Database
const dbConfigs = Configs.getDatabaseConfig();
const database = Database.init(dbConfigs);
database.sequelize.sync().then(() => {
    // console.log(database);
    const serverConfigs = Configs.getServerConfigs();
    //Starting Application Server
    const server = Server.init(serverConfigs, database).then((server) => {
        if (!module.parent) {
            server.start(() => {
                console.log('Server running at:', server.info.uri);
            });
            console.log("Running server from parent :)");
        }
        else {
            console.log("Not running the server because it is not run through parent module.");
        }
    });
});
//# sourceMappingURL=index.js.map