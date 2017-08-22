import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as config from '../../src/config';
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as url from 'url';

const assert: Chai.Assert = chai.assert;
const should: Chai.Should = chai.should();
let server: Hapi.Server;
let romansJwt: string;
let godJwt: string;
let jesusJwt: string;

describe('Tests for admin-panel user related endpoints.', () => {

    before(() => {
        server = Utils.getServerInstance();
        return Utils.getRoleBasedjwt('romans').then((res: string) => {
            romansJwt = res;
            return Utils.getRoleBasedjwt('god').then((res: string) => {
                godJwt = res;
                return Utils.getRoleBasedjwt('jesus').then((res: string) => {
                    jesusJwt = res;
                });
            });
        });
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for creating an account with role JESUS.", () => {

        it("Creates an account through GOD's account.", () => {
            return server.inject({
                method: 'POST', url: '/user/createJesus',
                headers: { "authorization": godJwt },
                payload: Utils.getUserDummy('createjesus@mail.com')
            }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload);
                responseBody.should.have.property('success');
                assert.equal(responseBody.success, true);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates an account through ROMANS's account.", () => {
            return server.inject({
                method: 'POST', url: '/user/createJesus',
                headers: { "authorization": romansJwt },
                payload: Utils.getUserDummy('createjesus@mail.com')
            }).then((res: any) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates an account with existing email.", () => {
            return Utils.createUserDummy('createjesus@mail.com', 'jesus').then(() => {
                return server.inject({
                    method: 'POST',
                    url: '/user/createJesus',
                    headers: { "authorization": godJwt },
                    payload: Utils.getUserDummy('createjesus@mail.com')
                }).then((res: any) => {
                    assert.equal(409, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Creates an account with invalid email.", () => {
            let user = Utils.getUserDummy("dummail.com");
            return server.inject({
                method: 'POST',
                url: '/user/createJesus',
                headers: { "authorization": godJwt },
                payload: user
            }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        describe('Sends missing data in the payload.', () => {

            it('Missing password.', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.password;
                return server.inject({
                    method: 'POST',
                    url: '/user/createJesus',
                    headers: { "authorization": godJwt },
                    payload: user
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing email.', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.email;
                return server.inject({
                    method: 'POST',
                    url: '/user/createJesus',
                    headers: { "authorization": godJwt },
                    payload: user
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

            it('Missing name.', () => {
                let user = Utils.getUserDummy('createJesus@mail.com');
                delete user.name;
                return server.inject({
                    method: 'POST',
                    url: '/user/createJesus',
                    headers: { "authorization": godJwt },
                    payload: user
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

        });
    });

    describe("Tests for getting download CSV link.", () => {

        it("Gets download CSV link through GOD's account.", () => {
            return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": godJwt } }).then((res: any) => {
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
            return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": romansJwt } }).then((res: any) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for downloading the users CSV.", () => {

        it("Downloads users CSV with a valid JWT.", () => {
            return Utils.getCsvJwt().then((jwt: string) => {
                return server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res: any) => {
                    let responseHeader: any = res.headers;
                    assert.equal(responseHeader["content-type"], "text/csv; charset=utf-8");
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Downloads users CSV with a invalid JWT.", () => {
            const jwt = "jwt=dummyjwt";
            return server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });

        it("Downloads users CSV with an expired JWT.", () => {
            return Utils.getCsvJwt().then((jwt: string) => {
                return new Promise((resolve, reject) => setTimeout(() => {
                    resolve();
                }, 1100)).then(() => {
                    return (server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    }));
                });
            });
        });
    });

    describe("Tests for getting user info in paginated fashion.", () => {
        it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
            return Utils.checkEndpointAccess('GET', '/user?page=6&size=3').then((res: any) => {
                assert.equal(res.romans, false);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Gets user info by sending valid query params.", () => {
            return Utils.createSeedUserData().then((res: any) => {
                return server.inject({
                    method: 'GET',
                    url: '/user?page=0&size=3',
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    let counter: number = 1;
                    responseBody.users.forEach((element) => {
                        assert.equal(element.name, "Dummy Jones");
                        assert.equal(element.email, `user${counter}@mail.com`);
                        counter++;
                    });
                    assert.isArray(responseBody.users);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Gets user info by sending invalid size in query params.", () => {
            return server.inject({ method: 'GET', url: '/user?page=6&size=3a', headers: { "authorization": godJwt } })
                .then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
        });

        it("Gets user info by sending invalid page in query params.", () => {
            return server.inject({ method: 'GET', url: '/user?page=6a&size=3', headers: { "authorization": godJwt } })
                .then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
        });

        describe('Sends missing data in the payload.', () => {
            it("Missing size.", () => {
                return server.inject({ method: 'GET', url: '/user?page=6', headers: { "authorization": godJwt } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Missing page.", () => {
                return server.inject({ method: 'GET', url: '/user?size=3', headers: { "authorization": godJwt } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });

    describe("Tests for getting info of a user from userId.", () => {
        it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
            return Utils.checkEndpointAccess('GET', '/user/1').then((res: any) => {
                assert.equal(res.romans, false);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Gets info of an existing user.", () => {
            return Utils.createUserDummy().then((user: any) => {
                return server.inject({
                    method: 'GET',
                    url: `/user/${user.id}`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    let userinfo: any = responseBody.user;
                    assert.equal(user.id, userinfo.id);
                    assert.equal(user.name, userinfo.name);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Gets info of a non-existant user.", () => {
            return server.inject({ method: 'GET', url: '/user/-1', headers: { "authorization": godJwt } }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload);
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });
});