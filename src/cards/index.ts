import * as Hapi from "hapi";
import Routes from "./routes";
import { IServerConfigurations } from "../config";

export function init(server: Hapi.Server, configs: IServerConfigurations, database: any) {

    Routes(server, configs, database);
}