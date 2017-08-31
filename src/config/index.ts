import * as nconf from "nconf";
import * as path from "path";
import * as Sequelize from 'sequelize';

//Read Configurations
const configs = new nconf.Provider({
    env: true,
    argv: true,
    store: {
        type: 'file',
        file: path.join(__dirname, `./config.${process.env.NODE_ENV}.json`)
    }
});

export interface IServerConfigurations {
    port: number;
    plugins: Array<string>;
    jwtSecret: string;
    jwtExpiration: string;
    jwtCsvSecret: string;
    jwtCsvExpiration: string;
    baseUrl: string;
    googleCloud: {
        projectId: string;
        keyFilename: string;
        cardBucket: string;
        encodedVideoBucket: string;
    };
    zenCoderApiKey: string;
    logglyToken: string;
    notifTime: {
        morning: number;
        evening: number;
        night: number;
    };
}

export interface IDb {
    sequelize: any;
    Sequelize: any;
    user: any;
    story: any;
    card: any;
    resetCode: any;
}

export function getServerConfigs(): IServerConfigurations {
    return configs.get("server");
}
