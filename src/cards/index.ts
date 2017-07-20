import * as Hapi from "hapi";
import Routes from "./routes";
import { IServerConfigurations } from "../configurations";
import * as Users from './cards';

export function init(server: Hapi.Server, configs: IServerConfigurations, database: any) {

    Routes(server, configs, database);
}