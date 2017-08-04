import * as Server from "./server";
import * as Configs from "./config";
import database from './models';
import * as Hapi from "hapi";

console.log(`Running enviroment ${process.env.NODE_ENV || "dev"}`);

const serverConfigs = Configs.getServerConfigs();
database.sequelize.sync().then(() => {
    //Starting Application Server
    Server.init(serverConfigs, database).then((server: Hapi.Server) => {
        server.start(() => {
            if (process.env.NODE_ENV === 'prod') {
                console.log('Server running at: http://staging.abstrct.co/api/');
                console.log('Docs available at http://staging.abstrct.co/api/docs');
            } else if (process.env.NODE_ENV === 'dev' || !process.env.NODE_ENV) {
                console.log('Server running at: http://loacalhost/api/');
                console.log('Docs available at http://localhost/api/docs');
            }
        });
    });
});