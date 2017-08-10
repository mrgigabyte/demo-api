import * as Hapi from "hapi";
import { IServerConfigurations } from "./config";

export function init(server: Hapi.Server, configs: IServerConfigurations, database: any) {

    server.route({
        method: 'GET',
        path: '/docs',
        config: {
            handler: function (request, reply: any) {
                reply.view('swaggerDocs.html', {});
            }
        }
    });
}
