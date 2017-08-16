import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as url from 'url';

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

    describe("Tests for changePushNotifPref endpoint", () => {

        it("Tries to change the pushNotif with invalid pushNotif value", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'PUT', url: '/user/me/changePushNotifPref', headers: { "authorization": login.jwt }, payload: { pushNotif: "evening" } }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Tries to change the pushNotif with valid pushNotif value", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'PUT', url: '/user/me/changePushNotifPref', headers: { "authorization": login.jwt }, payload: { pushNotif: "disable" } }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('updated');
                    assert.equal(responseBody.updated, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for changeEmailNotifPref endpoint", () => {

        it("Tries to change the emailNotif with invalid emailNotif value", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'PUT', url: '/user/me/changeEmailNotifPref', headers: { "authorization": login.jwt }, payload: { emailNotif: "disable" } }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Tries to change the emailNotif with valid emailNotif value", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'PUT', url: '/user/me/changeEmailNotifPref', headers: { "authorization": login.jwt }, payload: { emailNotif: false } }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('updated');
                    assert.equal(responseBody.updated, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for login endpoint", () => {

        it("checks if the account already exists", () => {

            let user = {
                email: Utils.getUserDummy().email,
                password: Utils.getUserDummy().password
            }

            return Utils.createUserDummy().then((res) => {
                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res) => {

                    let responseBody: any = JSON.parse(res.payload);
                    let userDetails: any = responseBody.user;
                    assert.equal(userDetails.name, Utils.getUserDummy().name);
                    assert.equal(userDetails.email, Utils.getUserDummy().email);
                    assert.isBoolean(userDetails.emailNotif);
                    assert.isNumber(userDetails.id);
                    assert.isString(userDetails.joinedOn);
                    assert.isNotNull(responseBody.jwt);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the account doesn't exist", () => {
            let user = {
                email: Utils.getUserDummy().email,
                password: Utils.getUserDummy().password
            }

            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });

        });

        it("Tries to login in with wrong credentials", () => {

            let user = {
                email: "dummydummy@email.com",
                password: Utils.getUserDummy().password
            }

            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res) => {
                assert.equal(401, res.statusCode);
                Promise.resolve();
            });

        });

        it("Tries to login in with invalid email id", () => {

            let user = {
                email: "dummyemail.com",
                password: Utils.getUserDummy().password
            }

            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });

        });

        describe('checks if the data is missing in the payload', () => {
            it("missing email id", () => {

                let user = {
                    password: Utils.getUserDummy().password
                }

                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("missing password", () => {

                let user = {
                    email: "dummyemail.com"
                }

                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

        });

    });

    describe("Tests for createJesus endpoint", () => {

        it("checks if the account doesn't exist", () => {
            return Utils.getGodjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if a roman or jesus is accessing the endpoint", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                    assert.equal(403, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the account already exists", () => {
            return Utils.getGodjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return Utils.createUserDummy('createJesus').then(() => {
                    return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                        assert.equal(409, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });

        it("Tries to create an account with invalid email", () => {
            return Utils.getGodjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                let user = Utils.getUserDummy("dummail.com");
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe('checks if there is missing data in the payload', () => {

            it('Missing Password', () => {
                return Utils.getGodjwt().then((res) => {
                    let login: any = JSON.parse(res.payload);
                    let user = Utils.getUserDummy('createJesus@mail.com');
                    delete user.password;
                    return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: user }).then((res) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing Email Id', () => {
                return Utils.getGodjwt().then((res) => {
                    let login: any = JSON.parse(res.payload);
                    let user = Utils.getUserDummy('createJesus@mail.com');
                    delete user.email;
                    return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: user }).then((res) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing name', () => {
                return Utils.getGodjwt().then((res) => {
                    let login: any = JSON.parse(res.payload);
                    let user = Utils.getUserDummy('createJesus@mail.com');
                    delete user.name;
                    return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": login.jwt }, payload: user }).then((res) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });
    });

    describe("Tests for /user/me DELETE endpoint", () => {

        it('tries to delete an account with valid token', () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'DELETE', url: '/user/me', headers: { "authorization": login.jwt } }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('deleted');
                    assert.equal(responseBody.deleted, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it('tries to delete an account with invalid token', () => {
            return Utils.getRomansjwt().then((res) => {
                let login = "dummy token"
                return server.inject({ method: 'DELETE', url: '/user/me', headers: { "authorization": login } }).then((res) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                    return Utils.clearDatabase();
                });
            });
        });
    });

    describe("Tests for /user/me GET endpoint", () => {

        it('tries to get details of the user with valid token', () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'GET', url: '/user/me', headers: { "authorization": login.jwt } }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    let userDetails: any = responseBody.user;
                    assert.equal(userDetails.name, Utils.getUserDummy().name);
                    assert.equal(userDetails.email, Utils.getUserDummy().email);
                    assert.isBoolean(userDetails.emailNotif);
                    assert.isString(userDetails.pushNotif);
                    assert.isNumber(userDetails.id);
                    assert.isString(userDetails.joinedOn);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it('tries to get details of the user with invalid token', () => {
            return Utils.getRomansjwt().then((res) => {
                let login = "dummy token"
                return server.inject({ method: 'GET', url: '/user/me', headers: { "authorization": login } }).then((res) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for /user/me PUT endpoint", () => {

        it("tries to update the user details with valid token and payload keys", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'PUT', url: '/user/me', headers: { "authorization": login.jwt }, payload: Utils.UpdatedUserDummy() }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('updated');
                    assert.equal(responseBody.updated, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("tries to update the account with invalid token", () => {
            return Utils.getRomansjwt().then((res) => {
                let login = 'dummy token';
                return server.inject({ method: 'PUT', url: '/user/me', headers: { "authorization": login }, payload: Utils.getUserDummy() }).then((res) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("tried to update the account with valid token and invalid email id", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                let user = Utils.getUserDummy("dummail.com");
                return server.inject({ method: 'PUT', url: '/user/me', headers: { "authorization": login.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for requestResetPassword endpoint", () => {

        it('checks if the account exists', () => {

            return Utils.createUserDummy().then(() => {
                return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: { email: Utils.getUserDummy().email } }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property("code")
                    assert.isString(responseBody.code);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the account doesn't exist", () => {
            return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: { email: Utils.getUserDummy().email } }).then((res) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });

        it('requests with an invalid email id', () => {

            return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: { email: "dummymail.com" } }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        it('checks if email id key is missing in the payload', () => {
            return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: {} }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for ResetPassword endpoint", () => {

        it('checks if the code is valid', () => {
            return Utils.getResetCode().then((res) => {
                let response: any = JSON.parse(res.payload);
                return server.inject({ method: 'POST', url: '/user/resetPassword', payload: Utils.getResetPasswordDetails(response.code) }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property("reset")
                    assert.equal(responseBody.reset, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the code is invalid", () => {
            return Utils.createUserDummy().then(() => {
                return server.inject({ method: 'POST', url: '/user/resetPassword', payload: Utils.getResetPasswordDetails("Invalid Code") }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it('checks for the invalid email when the code is valid', () => {
            return Utils.getResetCode().then((res) => {
                let response: any = JSON.parse(res.payload);
                return server.inject({ method: 'POST', url: '/user/resetPassword', payload: Utils.getResetPasswordDetails(response.code, "dummymail.com") }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe('checks if there is missing data in the payload', () => {

            it('Missing Code', () => {
                return Utils.getResetCode().then((res) => {
                    let response: any = JSON.parse(res.payload);
                    let user = Utils.getResetPasswordDetails(response.code);
                    delete user.code;
                    return server.inject({ method: 'POST', url: '/user/resetPassword', payload: user }).then((res) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing Email Id', () => {
                return Utils.getResetCode().then((res) => {
                    let response: any = JSON.parse(res.payload);
                    let user = Utils.getResetPasswordDetails(response.code);
                    delete user.email;
                    return server.inject({ method: 'POST', url: '/user/resetPassword', payload: user }).then((res) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing Password', () => {
                return Utils.getResetCode().then((res) => {
                    let response: any = JSON.parse(res.payload);
                    let user = Utils.getResetPasswordDetails(response.code);
                    delete user.password;
                    return server.inject({ method: 'POST', url: '/user/resetPassword', payload: user }).then((res) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });
    });

    describe("Tests for getCsvLink endpoint", () => {

        it("checks if the user is god/jesus and validates the jwt", () => {
            return Utils.getGodjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": login.jwt } }).then((res) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('link');
                    const csvlink = url.parse(responseBody.link);
                    const jwt = csvlink.query.split('jwt=').pop();
                    assert.isString(jwt);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if romans can access the link", () => {
            return Utils.getRomansjwt().then((res) => {
                let login: any = JSON.parse(res.payload);
                return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": login.jwt } }).then((res) => {
                    assert.equal(403, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });
});

