import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as Hapi from 'hapi';
import * as Utils from "../utils";


const assert = chai.assert;
const should = chai.should();
let server: Hapi.Server;

describe('user-controller non-admin tests', () => {

    before(() => {
        server = Utils.getServerInstance();
    });

    afterEach(() => {
        return Utils.clearDatabase();
    });

    describe("Tests for signup endpoint", () => {

        it("checks if the account doesn't exist", () => {
            return server.inject({ method: 'POST', url: '/user', payload: Utils.getUserDummy() }).then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('success');
                assert.equal(responseBody.success, true);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("checks if the account already exists", () => {
            Utils.createUserDummy().then(() => {
                return server.inject({ method: 'POST', url: '/user', payload: Utils.getUserDummy() }).then((res) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Tries to create an account with invalid email", () => {
            let user = Utils.getUserDummy("dummail.com");
            return server.inject({ method: 'POST', url: '/user', payload: user }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        describe('checks if there is missing data in the payload', () => {

            it('Missing Password', () => {
                let user = Utils.getUserDummy();
                delete user.password;
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing Email Id', () => {
                let user = Utils.getUserDummy();
                delete user.email;
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing name', () => {
                let user = Utils.getUserDummy();
                delete user.name;
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for checkEmail endpoint", () => {

        it("checks if the email doesn't exists", () => {
            return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummy@mail.com" } }).then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('valid');
                assert.equal(responseBody.valid, true);
                assert.equal(200, res.statusCode);
                Promise.resolve();
            });
        });


        it('checks if the email already exists', () => {
            Utils.createUserDummy().then(() => {
                return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummy@mail.com" } }).then((res) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it('checks if the email id is invalid ', () => {
            return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummymail.com" } }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        it('check for the missing email key in payload', () => {
            return server.inject({ method: 'POST', url: '/user/checkEmail', payload: {} }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });

    // describe("Tests for changePushNotifPref endpoint", () => {

    //     it("Tries to change the pushNotif with invalid pushNotif value", () => {
    //         Utils.getRomansjwt().then((res) => {
    //             let login: any = JSON.parse(res.payload);
    //             return server.inject({ method: 'PUT', url: '/user/me/changePushNotifPref', headers: { "authorization": login.jwt }, payload: { pushNotif: "evening" } }).then((res) => {
    //                 assert.equal(200, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });

    //     it("Tries to change the pushNotif with valid pushNotif value", () => {
    //         Utils.getRomansjwt().then((res) => {
    //             console.log(res)
    //             let login: any = JSON.parse(res.payload);
    //             return server.inject({ method: 'PUT', url: '/user/me/changePushNotifPref', headers: { "authorization": login.jwt }, payload: { pushNotif: "disable" } }).then((res) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 responseBody.should.have.property('success');
    //                 assert.equal(responseBody.success, true);
    //                 assert.equal(201, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });
    // });
});

