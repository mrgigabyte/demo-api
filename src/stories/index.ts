import * as Hapi from "hapi";
import Routes from "./routes";
import { IServerConfigurations } from "../config";
import * as Stories from './stories';
import * as Sequelize from 'sequelize';

export function init(server: Hapi.Server, configs: IServerConfigurations, database: any) {

    Routes(server, configs, database);
}