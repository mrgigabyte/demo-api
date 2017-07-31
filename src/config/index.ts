import * as nconf from "nconf";
import * as path from "path";
import * as Sequelize from 'sequelize';

//Read Configurations
const configs = new nconf.Provider({
    env: true,
    argv: true,
    store: {
        type: 'file',
        file: path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`)
    }
});

export interface IServerConfigurations {
    port: number;
    plugins: Array<string>;
    jwtSecret: string;
    jwtExpiration: string;
}

export interface IDb {
    sequelize: Sequelize.Sequelize;
    Sequelize: Sequelize.SequelizeStatic;
    user: Sequelize.Model<any,any>;
    story: Sequelize.Model<any,any>;
    card: Sequelize.Model<any,any>;            
    resetCode: Sequelize.Model<any,any>;    
}

export interface IDataConfiguration {
    client: string;
    database: string;
    host: string;
    user: string;
    password: string;
    requestTimeout: number;
    connectionTimeout: number;
    acquireConnectionTimeout: number;
    pool: {
        min: number;
        max: number;
    };
    models: Array<string>;
}

export function getServerConfigs(): IServerConfigurations {
    return configs.get("server");
}