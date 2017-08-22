import * as chai from "chai";
import * as Configs from "../src/config";
import * as Database from '../src/models';
import * as Server from "../src/server";
import { IDb } from "../src/config";
import * as Hapi from 'hapi';
import * as url from 'url';

let database: IDb = Database.init(process.env.NODE_ENV);
const serverConfig = Configs.getServerConfigs();
let server: Hapi.Server;
Server.init(serverConfig, database).then((Server: Hapi.Server) => {
    server = Server;
});

export function getUserDummy(email?: string, role?: string, password?: string, name?: string): any {
    let user = {
        email: email || "dummy@mail.com",
        name: name || "Dummy Jones",
        password: password || "123123",
        role: role || 'romans'
    };

    if (!role) {
        delete user.role;
    }

    return user;
}

export function getResetPasswordDetails(code: string, email?: string): any {
    let user = {
        code: code,
        email: email || "dummy@mail.com",
        password: "12223123"
    };

    return user;
}

export function getServerInstance(): any {
    return server;
}

export function clearDatabase(): Promise<any> {
    var promiseResetCodes = database.resetCode.destroy({ where: {} });
    var promiseDeletedUser = database.user.destroy({ where: { status: 'deleted' } });
    var promiseUser = database.user.destroy({ where: {} });
    return Promise.all([promiseResetCodes, promiseDeletedUser, promiseUser]);
}

export function createUserDummy(email?: string, role?: string): Promise<any> {
    role = role || 'romans';
    return database.user.create(getUserDummy(email, role));
}

export function getUserInfo(email: string): Promise<any> {
    return database.user.findOne({ where: { email: email } });
}


export function getRoleBasedjwt(role: string, email?: string): Promise<string> {
    let user = {
        email: email || `${role}@mail.com`,
        password: getUserDummy().password
    };
    return createUserDummy(user.email, role).then((res: any) => {
        return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
            let login: any = JSON.parse(res.payload);
            return login.jwt;
        });
    });
}

export function getResetCode(): Promise<any> {
    return createUserDummy().then(() => {
        return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: { email: getUserDummy().email } });
    });
}

export function getCsvJwt(): Promise<any> {
    return getRoleBasedjwt('god').then((jwt: string) => {
        return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": jwt } }).then((res: any) => {
            const jwt: any = JSON.parse(res.payload);
            const csvlink: string = url.parse(jwt.link).query;
            return csvlink;
        });
    });
}


export function checkEndpointAccess(httpMethod, httpUrl): Promise<any> {

    return new Promise((resolve, reject) => {
        let accessStatus = {
            romans: true,
            god: true,
            jesus: true
        };
        var PromiseRomans = getRoleBasedjwt('romans').then((jwt: string) => {
            return server.inject({ method: httpMethod, url: httpUrl, headers: { "authorization": jwt } }).then((res: any) => {
                if (res.statusCode === 403) {
                    accessStatus.romans = false;
                }
            });

        });

        var PromiseGod = getRoleBasedjwt('god').then((jwt: string) => {
            return server.inject({ method: httpMethod, url: httpUrl, headers: { "authorization": jwt } }).then((res: any) => {
                if (res.statusCode === 403) {
                    accessStatus.god = false;
                }
            });
        });

        var PromiseJesus = getRoleBasedjwt('jesus').then((jwt: string) => {
            return server.inject({ method: httpMethod, url: httpUrl, headers: { "authorization": jwt } }).then((res: any) => {
                if (res.statusCode === 403) {
                    accessStatus.jesus = false;
                }
            });
        });

        Promise.all([PromiseRomans, PromiseGod, PromiseJesus]).then(() => {
            return resolve(accessStatus);
        });
    });
}

export function createSeedUserData(): Promise<any> {
    return Promise.all([
        createUserDummy("user1@mail.com"),
        createUserDummy("user2@mail.com"),
        createUserDummy("user3@mail.com"),
    ]);

}