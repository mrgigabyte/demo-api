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

export function getUserDummy(email?: string) {
    var user = {
        email: email || "dummy@mail.com",
        name: "Dummy Jones",
        password: "123123"
    };

    return user;
}

export function UpdatedUserDummy(email?: string) {
    var user = {
        email: email || "dummy123@mail.com",
        name: "John Doe",
        password: "321321"
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
    var promiseDeletedUser = database.user.destroy({ where: {status: 'deleted'} })
    var promiseUser = database.user.destroy({ where: {} })
    return Promise.all([promiseDeletedUser,promiseResetCodes, promiseUser]);
}

export function createUserDummy(type?: string): Promise<any> {
    if (type) {
        if (type === 'createJesus') {
            return database.user.create(getUserDummy('createjesus@mail.com'))
                .catch((error) => {
                    console.log(error);
                });
        }
    } else {
        return database.user.create(getUserDummy())
            .catch((error) => {
                console.log(error);
            });
    }
}

export function getRomansjwt() {
    let user = {
        email: getUserDummy().email,
        password: getUserDummy().password
    };
    return createUserDummy().then((res) => {
        return server.inject({ method: 'POST', url: '/user/login', payload: user });
    });
}

export function getGodjwt() {
    let user = {
        email: getUserDummy().email,
        password: getUserDummy().password
    }

    return createUserDummy().then((res) => {
        return database.user.update({ role: "god" }, { where: { id: res.id } }).then(() => {
            return server.inject({ method: 'POST', url: '/user/login', payload: user });
        });
    });

}

// export function createSeedTaskData(database: Database.IDatabase, done: MochaDone) {
//     return database.userModel.create(createUserDummy())
//         .then((user) => {
//             return Promise.all([
//                 database.taskModel.create(createTaskDummy(user._id, "Task 1", "Some dummy data 1")),
//                 database.taskModel.create(createTaskDummy(user._id, "Task 2", "Some dummy data 2")),
//                 database.taskModel.create(createTaskDummy(user._id, "Task 3", "Some dummy data 3")),
//             ]);
//         }).then((task) => {
//             done();
//         }).catch((error) => {
//             console.log(error);
//         });
// }


