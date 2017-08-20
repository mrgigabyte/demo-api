// import * as Database from "../src/database";
// import * as Database from '../src/models';

import * as chai from "chai";
import UserController from "../src/users/user-controller";
import * as Configs from "../src/config";
import * as Database from '../src/models';
import * as Server from "../src/server";
import { IDb } from "../src/config";
import * as Hapi from 'hapi';

let database: IDb = Database.init(process.env.NODE_ENV);
const serverConfig = Configs.getServerConfigs();
let server: Hapi.Server;
Server.init(serverConfig, database).then((Server: Hapi.Server) => {
    server = Server;
});

export function getUserDummy(email?: string, role?: string, password?: string, name?: string) {
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

export function getResetPasswordDetails(code: string, email?: string) {
    let user = {
        code: code,
        email: email || "dummy@mail.com",
        password: "12223123"
    };

    return user;
}

export function getServerInstance() {
    return server;
}

// export function createInvalidUserDummy(email?: string, name?: string, password?: string): Promise<any> {
//     var user = {
//         email: email || "",
//         name: name || "",
//         password: password || ""
//     };

//     console.log(user);


//     // return user;
// }

export function clearDatabase() {
    var promiseResetCodes = database.resetCode.destroy({ where: {} })
    var promiseDeletedUser = database.user.destroy({ where: { status: 'deleted' } })
    var promiseUser = database.user.destroy({ where: {} })
    return Promise.all([promiseResetCodes, promiseDeletedUser, promiseUser]);
}

export function createUserDummy(email?: string, role?: string): Promise<any> {
    role = role || 'romans';
    return database.user.create(getUserDummy(email, role))
}

export function getRomansjwt(email?: string): Promise<any> {
    let user = {
        email: email || getUserDummy().email,
        password: getUserDummy().password
    };
    return createUserDummy(user.email).then((res) => {
        return server.inject({ method: 'POST', url: '/user/login', payload: user });
    });
}

export function getGodjwt(email?: string): Promise<any> {
    let user = {
        email: email || 'god@mail.com',
        password: getUserDummy().password
    }

    return createUserDummy(user.email, 'god').then((res) => {
        return server.inject({ method: 'POST', url: '/user/login', payload: user });
    });
}

export function getJesusjwt(email?: string): Promise<any> {
    let user = {
        email: email || 'jesus@mail.com',
        password: getUserDummy().password
    }

    return createUserDummy(user.email, 'jesus').then((res) => {
        return server.inject({ method: 'POST', url: '/user/login', payload: user });
    });
}

export function getResetCode(): Promise<any> {
    return createUserDummy().then(() => {
        return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: { email: getUserDummy().email } })
    });
}

export function getCsvJwt(): Promise<any> {
    return getGodjwt().then((res) => {
        let login: any = JSON.parse(res.payload);
        return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": login.jwt } })
    });
}

export function checkEndpointAccess(httpMethod, httpUrl): Promise<any> {

    return new Promise((resolve, reject) => {
        let accessStatus = {
            romans: true,
            god: true,
            jesus: true
        };
        var PromiseRomans = getRomansjwt().then((res) => {
            let login: any = JSON.parse(res.payload);
            return server.inject({ method: httpMethod, url: httpUrl, headers: { "authorization": login.jwt } }).then((res) => {
                if (res.statusCode === 403) {
                    accessStatus.romans = false;
                }
            });

        });

        var PromiseGod = getGodjwt().then((res) => {
            let login: any = JSON.parse(res.payload);
            return server.inject({ method: httpMethod, url: httpUrl, headers: { "authorization": login.jwt } }).then((res) => {
                if (res.statusCode === 403) {
                    accessStatus.god = false;
                }
            });
        });

        var PromiseJesus = getJesusjwt().then((res) => {
            let login: any = JSON.parse(res.payload);
            return server.inject({ method: httpMethod, url: httpUrl, headers: { "authorization": login.jwt } }).then((res) => {
                if (res.statusCode === 403) {
                    accessStatus.jesus = false;
                }
            });
        });

        return Promise.all([PromiseRomans, PromiseGod, PromiseJesus]).then(() => {
            return resolve(accessStatus);
        }).catch((err) => {
            console.log("err", err);
        });
    })
}

export function createSeedUserData() {
    return Promise.all([
        database.user.create(createUserDummy("user1@mail.com")),
        database.user.create(createUserDummy("user2@mail.com")),
        database.user.create(createUserDummy("user3@mail.com")),
    ]);

}


