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

    describe("Tests of endpoints that do not require authorization header.", () => {
        describe("Tests for creating an account with role ROMANS.", () => {
            it("Creates an account with valid details.", () => {
                return server.inject({ method: 'POST', url: '/user', payload: Utils.getUserDummy() }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(201, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Creates an account with existing email.", () => {
                return Utils.createUserDummy().then(() => {
                    return server.inject({ method: 'POST', url: '/user', payload: Utils.getUserDummy() }).then((res: any) => {
                        assert.equal(409, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it("Creates an account with invalid email.", () => {
                let user = Utils.getUserDummy("dummail.com");
                return server.inject({ method: 'POST', url: '/user', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            describe('Sends missing data in the payload', () => {
                it('Missing password.', () => {
                    let user = Utils.getUserDummy();
                    delete user.password;
                    return server.inject({ method: 'POST', url: '/user', payload: user }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });

                it('Missing email.', () => {
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

        describe("Tests for GET /user/checkEmail endpoint.", () => {
            it("Checks if the email doesn't exists", () => {
                return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummy@mail.com" } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('valid');
                    assert.equal(responseBody.valid, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Checks if the email already exists', () => {
                return Utils.createUserDummy().then(() => {
                    return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummy@mail.com" } })
                        .then((res: any) => {
                            assert.equal(409, res.statusCode);
                            Promise.resolve();
                        });
                });
            });

            it('Checks if the email id is invalid ', () => {
                return server.inject({ method: 'POST', url: '/user/checkEmail', payload: { email: "dummymail.com" } }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Sends empty payload in the request.', () => {
                return server.inject({ method: 'POST', url: '/user/checkEmail', payload: {} }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests of endpoints that require authorization header.", () => {
        beforeEach(() => {
            return Utils.getRoleBasedjwt('romans').then((res: string) => {
                romansJwt = res;
            });
        });

        describe("Tests for changing push notification preference.", () => {
            it("Changes push notification with invalid pushNotif value.", () => {
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

            it("Changes push notification with valid pushNotif value", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me/changePushNotifPref',
                    headers: { "authorization": romansJwt },
                    payload: { pushNotif: "disable" }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe("Tests for changing email notification preference.", () => {
            it("Changes email notification with invalid emailNotif value", () => {
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

            it("Changes email notification with valid emailNotif value", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me/changeEmailNotifPref',
                    headers: { "authorization": romansJwt },
                    payload: { emailNotif: false }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe("Tests for deleting a user.", () => {
            it('Deletes the user account.', () => {
                return server.inject({ method: 'DELETE', url: '/user/me', headers: { "authorization": romansJwt } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('deleted');
                    assert.equal(responseBody.deleted, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Deletes the user account with invalid jwt.', () => {
                let login: string = "dummy jwt";
                return server.inject({ method: 'DELETE', url: '/user/me', headers: { "authorization": login } }).then((res: any) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                    return Utils.clearDatabase();
                });
            });
        });

        describe("Tests for getting info of a logged in user.", () => {
            it('Gets info of the user with valid jwt.', () => {
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

            it('Gets info of the user with invalid jwt', () => {
                let login: string = "dummy jwt";
                return server.inject({ method: 'GET', url: '/user/me', headers: { "authorization": login } }).then((res: any) => {
                    assert.equal(401, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe("Tests for updating info of a logged in user.", () => {
            it("Updates the user info with valid jwt and payload.", () => {
                return server.inject({
                    method: 'PUT',
                    url: '/user/me',
                    headers: { "authorization": romansJwt },
                    payload: Utils.getUserDummy('dummy123@gmail.com', undefined, '312321', 'John Doe')
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('success');
                    assert.equal(responseBody.success, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Updates the user infor with invalid jwt and valid payload.", () => {
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

            it("Updates the user info with valid jwt and invalid payload.", () => {
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
        it("Logs in a user and validates the response.", () => {
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

        it("Logs in in with wrong credentials.", () => {
            let user = {
                email: "dummydummy@email.com",
                password: Utils.getUserDummy().password
            };
            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                assert.equal(401, res.statusCode);
                Promise.resolve();
            });

        });

        it("Logs in in with invalid email.", () => {
            let user = {
                email: "dummyemail.com",
                password: Utils.getUserDummy().password
            };
            return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });

        });

        describe('Sends missing data in the payload.', () => {
            it("Missing email.", () => {
                let user = {
                    password: Utils.getUserDummy().password
                };
                return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Missing password.", () => {
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

    describe("Tests for requesting reset password.", () => {
        it('Requests to reset password of an existing user.', () => {
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

        it("Requests to reset password of an non-existing user.", () => {
            return server.inject({
                method: 'POST',
                url: '/user/requestResetPassword',
                payload: { email: Utils.getUserDummy().email }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });

        it('Requests to reset password with an invalid email.', () => {
            return server.inject({
                method: 'POST',
                url: '/user/requestResetPassword',
                payload: { email: "dummymail.com" }
            }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        it('Requests to reset password with an empty payload.', () => {
            return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: {} }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for resetting the password.", () => {
        it('Resets the password with valid payload.', () => {
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

        it("Resets the password with invalid code.", () => {
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

        it('Resets the password with invalid email and valid code.', () => {
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

        describe('Sends missing data in the payload', () => {
            it('Missing code.', () => {
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

            it('Missing email.', () => {
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

            it('Missing password.', () => {
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

