import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as url from 'url';

const assert = chai.assert;
const should = chai.should();
let server: Hapi.Server;
let romansJwt: string;

describe('Tests for app-side user related endoints.', () => {

    before(() => {
        server = Utils.getServerInstance();
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for creating a new account.", () => {



        it("Creates an account with role ROMANS.", () => {
            return server.inject({ method: 'POST', url: '/user', payload: Utils.getUserDummy() }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('success');
                assert.equal(responseBody.success, true);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates an account with existing email and role ROMANS.", () => {
            Utils.createUserDummy().then(() => {
                return server.inject({ method: 'POST', url: '/user', payload: Utils.getUserDummy() }).then((res: any) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Creates an account with invalid email and role ROMANS.", () => {
            let user = Utils.getUserDummy("dummail.com");
            return server.inject({ method: 'POST', url: '/user', payload: user }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        describe('Checks if there is missing data in the payload.', () => {

            it('Missing Password.', () => {
                let user = Utils.getUserDummy();
                delete user.password;
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing Email Id.', () => {
                let user = Utils.getUserDummy();
                delete user.email;
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing name.', () => {
                let user = Utils.getUserDummy();
                delete user.name;
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for checking email endpoint", () => {

        it("checks if the email doesn't exists", () => {
            return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummy@mail.com" } }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('valid');
                assert.equal(responseBody.valid, true);
                assert.equal(200, res.statusCode);
                Promise.resolve();
            });
        });


        it('checks if the email already exists', () => {
            Utils.createUserDummy().then(() => {
                return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummy@mail.com" } }).then((res: any) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it('checks if the email id is invalid ', () => {
            return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummymail.com" } }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        it('check for the missing email key in payload', () => {
            return server.inject({ method: 'POST', url: '/user/checkEmail', payload: {} }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests which need authorization header", () => {

        beforeEach(() => {
            return Utils.getRoleBasedjwt('romans').then((res: any) => {
                romansJwt = res;

            });
        });

        describe("Tests for changing push notification preference endpoint", () => {

            it("checks if god, jesus and romans can access the endpoint", () => {
                return Utils.checkEndpointAccess('PUT', '/user/me/changePushNotifPref').then((res: any) => {
                    assert.equal(res.romans, true);
                    assert.equal(res.god, true);
                    assert.equal(res.jesus, true);
                    Promise.resolve();
                });
            });

            it("Tries to change the pushNotif with invalid pushNotif value", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me/changePushNotifPref',
                    headers: { "authorization": romansJwt },
                    payload: { pushNotif: "evening" }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Tries to change the pushNotif with valid pushNotif value", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me/changePushNotifPref',
                    headers: { "authorization": romansJwt },
                    payload: { pushNotif: "disable" }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe("Tests for changing email notification preference endpoint", () => {

            it("Tries to change the emailNotif with invalid emailNotif value", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me/changeEmailNotifPref',
                    headers: { "authorization": romansJwt },
                    payload: { emailNotif: "disable" }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Tries to change the emailNotif with valid emailNotif value", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me/changeEmailNotifPref',
                    headers: { "authorization": romansJwt },
                    payload: { emailNotif: false }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe("Tests for deleting the user account (/user/me) endpoint", () => {

            it('tries to delete an account with valid jwt', () => {
                return server.inject({ method: 'DELETE', url: '/user/me', headers: { "authorization": romansJwt } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('deleted');
                    assert.equal(responseBody.deleted, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });

            it('tries to delete an account with invalid jwt', () => {
                let login: string = "dummy jwt";
                return server.inject({ method: 'DELETE', url: '/user/me', headers: { "authorization": login } }).then((res: any) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                    return Utils.clearDatabase();
                });
            });
        });

        describe("Tests for getting user-info (/user/me) endpoint", () => {

            it('tries to get details of the user with valid jwt', () => {
                return server.inject({ method: 'GET', url: '/user/me', headers: { "authorization": romansJwt } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    let userDetails: any = responseBody.user;
                    assert.equal(userDetails.name, Utils.getUserDummy().name);
                    assert.equal(userDetails.email, 'romans@mail.com');
                    assert.isBoolean(userDetails.emailNotif);
                    assert.isString(userDetails.pushNotif);
                    assert.isNumber(userDetails.id);
                    assert.isString(userDetails.joinedOn);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });

            it('tries to get details of the user with invalid jwt', () => {
                let login: string = "dummy jwt";
                return server.inject({ method: 'GET', url: '/user/me', headers: { "authorization": login } }).then((res: any) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe("Tests for updating user-info (/user/me) endpoint", () => {

            it("tries to update the user details with valid jwt and payload keys", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me',
                    headers: { "authorization": romansJwt },
                    payload: Utils.getUserDummy('dummy123@gmail.com', undefined, '312321', 'John Doe')
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });

            it("tries to update the account with invalid jwt", () => {
                let login: string = 'dummy jwt';
                return server.inject({
                    method: 'PUT',
                    url: '/user/me',
                    headers: { "authorization": login },
                    payload: Utils.getUserDummy()
                }).then((res: any) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                });
            });

            it("tried to update the account with valid jwt and invalid email id", () => {
                let user = Utils.getUserDummy("dummail.com");
                return server.inject({
                    method: 'PUT',
                    url: '/user/me',
                    headers: { "authorization": romansJwt },
                    payload: user
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
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
            };

            return Utils.createUserDummy().then((res: any) => {
                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {

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
            };

            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });

        });

        it("Tries to login in with wrong credentials", () => {

            let user = {
                email: "dummydummy@email.com",
                password: Utils.getUserDummy().password
            };

            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                assert.equal(401, res.statusCode);
                Promise.resolve();
            });

        });

        it("Tries to login in with invalid email id", () => {

            let user = {
                email: "dummyemail.com",
                password: Utils.getUserDummy().password
            };

            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });

        });

        describe('checks if the data is missing in the payload', () => {
            it("missing email id", () => {

                let user = {
                    password: Utils.getUserDummy().password
                };

                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("missing password", () => {

                let user = {
                    email: "dummyemail.com"
                };

                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

        });

    });

    describe("Tests for requesting reset password code endpoint", () => {

        it('checks if the account exists', () => {

            return Utils.createUserDummy().then(() => {
                return server.inject({
                    method: 'POST',
                    url: '/user/requestResetPassword',
                    payload: { email: Utils.getUserDummy().email }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property("code");
                    assert.isString(responseBody.code);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the account doesn't exist", () => {
            return server.inject({
                method: 'POST',
                url: '/user/requestResetPassword',
                payload: { email: Utils.getUserDummy().email }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });

        it('requests with an invalid email id', () => {

            return server.inject({
                method: 'POST',
                url: '/user/requestResetPassword',
                payload: { email: "dummymail.com" }
            }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        it('checks if email id key is missing in the payload', () => {
            return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: {} }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for resetting the password endpoint", () => {

        it('checks if the code is valid', () => {
            return Utils.getResetCode().then((res: any) => {
                let response: any = JSON.parse(res.payload);
                return server.inject({
                    method: 'POST',
                    url: '/user/resetPassword',
                    payload: Utils.getResetPasswordDetails(response.code)
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property("reset");
                    assert.equal(responseBody.reset, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the code is invalid", () => {
            return Utils.createUserDummy().then(() => {
                return server.inject({
                    method: 'POST',
                    url: '/user/resetPassword',
                    payload: Utils.getResetPasswordDetails("Invalid Code")
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it('checks for the invalid email when the code is valid', () => {
            return Utils.getResetCode().then((res: any) => {
                let response: any = JSON.parse(res.payload);
                return server.inject({
                    method: 'POST',
                    url: '/user/resetPassword',
                    payload: Utils.getResetPasswordDetails(response.code, "dummymail.com")
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe('checks if there is missing data in the payload', () => {

            it('Missing Code', () => {
                return Utils.getResetCode().then((res: any) => {
                    let response: any = JSON.parse(res.payload);
                    let user = Utils.getResetPasswordDetails(response.code);
                    delete user.code;
                    return server.inject({ method: 'POST', url: '/user/resetPassword', payload: user }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing Email Id', () => {
                return Utils.getResetCode().then((res: any) => {
                    let response: any = JSON.parse(res.payload);
                    let user = Utils.getResetPasswordDetails(response.code);
                    delete user.email;
                    return server.inject({ method: 'POST', url: '/user/resetPassword', payload: user }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing Password', () => {
                return Utils.getResetCode().then((res: any) => {
                    let response: any = JSON.parse(res.payload);
                    let user = Utils.getResetPasswordDetails(response.code);
                    delete user.password;
                    return server.inject({ method: 'POST', url: '/user/resetPassword', payload: user }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });
    });
});

