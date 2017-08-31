import * as Hapi from "hapi";
import { IPlugin } from "./plugins/interfaces";
import { IServerConfigurations } from "./config";

import * as Users from "./users";
import * as Stories from "./stories";
import * as Cards from "./cards";
import * as Documetation from "./documentation";
import * as winston from 'winston';
import * as LogglyTransport from 'winston-loggly-transport';

export function init(configs: IServerConfigurations, database: any): Promise<Hapi.Server> {
    return new Promise<Hapi.Server>(resolve => {
        const port = process.env.port || configs.port;
        const server = new Hapi.Server();

        /**
         * Intialize logger which will be used to send logs to loggly.
         */
        const logger = new winston.Logger({
            transports: [
                new LogglyTransport({
                    token: configs.logglyToken,
                    subdomain: "abstrct",
                    tags: ["error-log"],
                    json: true
                })]
        });

        server.connection({
            port: port,
            routes: {
                cors: {
                    "headers": ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"]
                },
                log: true
            }
        });

        /**
         * This will log an internal server error to loggly if any internal error come in the code.
         */
        server.on('request-error', (request, err) => {
            logger.error(err.message, {
                method: request.method,
                path: request.url.href,
                payload: request.payload,                
                headers: request.headers,
                stack: err.stack
            });
        });

        //  Setup Hapi Plugins
        const plugins: Array<string> = configs.plugins;
        const pluginOptions = {
            database: database,
            serverConfigs: configs
        };

        let pluginPromises = [];

        plugins.forEach((pluginName: string) => {
            var plugin: IPlugin = (require("./plugins/" + pluginName)).default();
            console.log(`Register Plugin ${plugin.info().name} v${plugin.info().version}`);
            pluginPromises.push(plugin.register(server, pluginOptions));
        });

        // Register all the routes once all plugins have been initialized
        Promise.all(pluginPromises).then(() => {
            // Configured handlebars as the template engine.
            // I have made a custom template for swagger using handlebars.            
            server.views({
                path: 'src/templates',
                engines: { html: require('handlebars') },
                isCached: false
            });
            Users.init(server, configs, database);
            Stories.init(server, configs, database);
            Cards.init(server, configs, database);
            Documetation.init(server, configs, database);
            resolve(server);
        });
    });
}