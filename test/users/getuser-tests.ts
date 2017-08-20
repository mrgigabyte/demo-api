// import * as chai from "chai";
// import UserController from "../../src/users/user-controller";
// import { IDb } from "../../src/config";
// import * as Hapi from 'hapi';
// import * as Utils from "../utils";
// import * as url from 'url';

// const should = chai.should();
// const assert = chai.assert;
// let server: Hapi.Server;


// describe("Tests for getting info of all the users", () => {

//     before(() => {
//         server = Utils.getServerInstance();
//     });

//     afterEach(() => {
//         return Utils.clearDatabase();
//     });

//     // it("checks if god & jesus can access the endpoint and romans cant", () => {
//     //     return Utils.checkEndpointAccess('GET', '/user?page=6&size=3').then((res) => {
//     //         assert.equal(res.romans, false);
//     //         assert.equal(res.god, true);
//     //         assert.equal(res.jesus, true);
//     //         Promise.resolve();
//     //     });
//     // });

//     it("tries to send valid page and size in the payload", () => {
//         return Utils.getGodjwt().then((res) => {
//             let login: any = JSON.parse(res.payload);
//             return Utils.createSeedUserData().then(() => {
//                 return server.inject({ method: 'GET', url: '/user?page=1&size=3', headers: { "authorization": login.jwt } }).then((res) => {
//                     let responseBody: any = JSON.parse(res.payload);
//                     assert.isArray(responseBody.users);
//                     assert.equal(200, res.statusCode);
//                     Promise.resolve();
//                 });
//             });
//         });
//     });

//     it("tries to get the user info with invalid size value", () => {
//         return Utils.getGodjwt().then((res) => {
//             let login: any = JSON.parse(res.payload);
//             return server.inject({ method: 'GET', url: '/user?page=6&size=3a', headers: { "authorization": login.jwt } }).then((res) => {
//                 let responseBody: any = JSON.parse(res.payload);
//                 assert.equal(400, res.statusCode);
//                 Promise.resolve();
//             });
//         });
//     });

//     it("tries to get the user info with invalid page value", () => {
//         return Utils.getGodjwt().then((res) => {
//             let login: any = JSON.parse(res.payload);
//             return server.inject({ method: 'GET', url: '/user?page=6a&size=3', headers: { "authorization": login.jwt } }).then((res) => {
//                 let responseBody: any = JSON.parse(res.payload);
//                 assert.equal(400, res.statusCode);
//                 Promise.resolve();
//             });
//         });
//     });

//     describe('checks if there is missing data in the payload', () => {
//         it("missing size", () => {
//             return Utils.getGodjwt().then((res) => {
//                 let login: any = JSON.parse(res.payload);
//                 return server.inject({ method: 'GET', url: '/user?page=6', headers: { "authorization": login.jwt } }).then((res) => {
//                     let responseBody: any = JSON.parse(res.payload);
//                     assert.equal(400, res.statusCode);
//                     Promise.resolve();
//                 });
//             });
//         });

//         it("missing value", () => {
//             return Utils.getGodjwt().then((res) => {
//                 let login: any = JSON.parse(res.payload);
//                 return server.inject({ method: 'GET', url: '/user?size=3', headers: { "authorization": login.jwt } }).then((res) => {
//                     let responseBody: any = JSON.parse(res.payload);
//                     assert.equal(400, res.statusCode);
//                     Promise.resolve();
//                 });
//             });
//         });
//     });
// });