import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as url from 'url';

const assert = chai.assert;
const should = chai.should();
let server: Hapi.Server;
let romansJwt: any;
let godJwt: any;
let jesusJwt: any;

describe('Tests for admin-panel user related endpoints.', () => {

    before(() => {
        server = Utils.getServerInstance();
        return Utils.getRomansjwt().then((res) => {
            romansJwt = JSON.parse(res.payload);
            return Utils.getGodjwt().then((res) => {
                godJwt = JSON.parse(res.payload);
                return Utils.getJesusjwt().then((res) => {
                    jesusJwt = JSON.parse(res.payload);
                });
            });
        });
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for creating a user account with role JESUS.", () => {

        it("Creates an account with role JESUS through GOD's account.", () => {
            return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godJwt.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('success');
                assert.equal(responseBody.success, true);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates an account with role JESUS through ROMANS's account.", () => {
            return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": romansJwt.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates an account with existing email and role JESUS.", () => {
            return Utils.createUserDummy('createjesus@mail.com', 'jesus').then(() => {
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godJwt.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Creates an account with invalid email and role JESUS.", () => {
            let user = Utils.getUserDummy("dummail.com");
            return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godJwt.jwt }, payload: user }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        describe('checks if there is missing data in the payload', () => {

            it('Missing Password', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.password;
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godJwt.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing Email Id', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.email;
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godJwt.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

            it('Missing name', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.name;
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godJwt.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

        });
    });

    describe("Tests for getting download CSV link.", () => {

        it("Gets download CSV link through GOD's account.", () => {
            return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": godJwt.jwt } }).then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('link');
                const csvlink = url.parse(responseBody.link);
                const jwt = csvlink.query.split('jwt=').pop();
                assert.isString(jwt);
                assert.equal(200, res.statusCode);
                Promise.resolve();
            });
        });

        it("Gets download CSV link through ROMANS's account.", () => {
            return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": romansJwt.jwt } }).then((res) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for downloading the users CSV.", () => {

        it("Downloads users CSV with a valid JWT.", () => {
            return Utils.getCsvJwt().then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                const csvlink = url.parse(responseBody.link);
                return server.inject({ method: 'GET', url: '/user/downloadCsv?' + csvlink.query }).then((res) => {
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Downloads users CSV with a invalid JWT.", () => {
            const jwt = "jwt=dummyjwt"
            return server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });
});