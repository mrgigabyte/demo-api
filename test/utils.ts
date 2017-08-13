// import * as Database from "../src/database";
// import * as Database from '../src/models';

import * as chai from "chai";
import UserController from "../src/users/user-controller";
import * as Configs from "../src/config";
import * as Database from '../src/models';
import * as Server from "../src/server";
import { IDb } from "../src/config";
import * as Hapi from 'hapi';

// let database: IDb = Database.init(process.env.NODE_ENV);

export function createUserDummy(email?: string) {
    var user = {
        email: email || "dummy@mail.com",
        name: "Dummy Jones",
        password: "123123"
    };

    return user;
}

export function clearDatabase(database: IDb, done: MochaDone) {
    var promiseUser = database.user.destroy({
  where: {}
})
    Promise.all([promiseUser]).then(() => {
        // Promise.resolve();
        done();
    }).catch((error) => {
        console.log(error);
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

export function createSeedUserData(database: IDb) {
   database.user.create(createUserDummy())
        .catch((error) => {
            console.log(error);
        });
}

