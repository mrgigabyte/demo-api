import * as Hapi from "hapi";
import { IServerConfigurations } from "./configurations";

export function init(server: Hapi.Server, configs: IServerConfigurations, database: any) {

    server.route({
        method: 'GET',
        path: '/',
        config: {
            handler: function (request, reply: any) {
                reply.view('custom.html', {});
            }
        }
    });
}
