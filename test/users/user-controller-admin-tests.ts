import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as url from 'url';

const assert = chai.assert;
const should = chai.should();
let server: Hapi.Server;
let romanslogin: any;
let godlogin: any;
let jesuslogin: any;

describe('Tests for admin panel endpoints', () => {

    before(() => {
        server = Utils.getServerInstance();
        return Utils.getRomansjwt().then((res) => {
            romanslogin = JSON.parse(res.payload);
            return Utils.getGodjwt().then((res) => {
                godlogin = JSON.parse(res.payload);
                return Utils.getJesusjwt().then((res) => {
                    jesuslogin = JSON.parse(res.payload);
                });
            });
        });
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for creating a user account with Jesus role endpoint", () => {

        it("checks if the account doesn't exist", () => {
            return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godlogin.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('success');
                assert.equal(responseBody.success, true);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("checks if a roman or jesus is accessing the endpoint", () => {
            return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": romanslogin.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });

        it("checks if the account already exists", () => {
            return Utils.createUserDummy('createjesus@mail.com', 'jesus').then(() => {
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godlogin.jwt }, payload: Utils.getUserDummy('createjesus@mail.com') }).then((res) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Tries to create an account with invalid email", () => {
            let user = Utils.getUserDummy("dummail.com");
            return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godlogin.jwt }, payload: user }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        describe('checks if there is missing data in the payload', () => {

            it('Missing Password', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.password;
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godlogin.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing Email Id', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.email;
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godlogin.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

            it('Missing name', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.name;
                return server.inject({ method: 'POST', url: '/user/createJesus', headers: { "authorization": godlogin.jwt }, payload: user }).then((res) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

        });
    });

    describe("Tests for getting jwt for CSV endpoint", () => {

        it("checks if the user is god/jesus", () => {
            return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": godlogin.jwt } }).then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('link');
                const csvlink = url.parse(responseBody.link);
                const jwt = csvlink.query.split('jwt=').pop();
                assert.isString(jwt);
                assert.equal(200, res.statusCode);
                Promise.resolve();
            });
        });

        it("checks if romans can access the link", () => {
            return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": romanslogin.jwt } }).then((res) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for downloading the CSV endpoint", () => {

        it("checks if the jwt is valid", () => {
            return Utils.getCsvJwt().then((res) => {
                let responseBody: any = JSON.parse(res.payload);
                const csvlink = url.parse(responseBody.link);
                return server.inject({ method: 'GET', url: '/user/downloadCsv?' + csvlink.query }).then((res) => {
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("checks if the jwt is invalid", () => {
            const jwt = "jwt=dummyjwt"
            return server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });
});