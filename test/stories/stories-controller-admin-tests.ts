import * as chai from "chai";
import UserController from "../../src/users/user-controller";
import { IDb } from "../../src/config";
import * as config from '../../src/config';
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as url from 'url';
import * as moment from 'moment';

const assert: Chai.Assert = chai.assert;
const should: Chai.Should = chai.should();
let server: Hapi.Server;
let romansJwt: string;
let godJwt: string;
let jesusJwt: string;

describe('Tests for admin-panel stories related endpoints.', () => {

    before(() => {
        server = Utils.getServerInstance();
        return Utils.getRoleBasedjwt('romans').then((res: string) => {
            romansJwt = res;
            return Utils.getRoleBasedjwt('god').then((res: string) => {
                godJwt = res;
                return Utils.getRoleBasedjwt('jesus').then((res: string) => {
                    jesusJwt = res;
                    Promise.resolve();
                });
            });
        });
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for creating a new story.", () => {

        it("Creates a new story through GOD's account.", () => {
            let story = Utils.getStoryDummy();
            return server.inject({
                method: 'POST', url: '/user/story',
                headers: { "authorization": godJwt },
                payload: story
            }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload).story;
                assert.equal(responseBody.title, story.title);
                assert.isNumber(responseBody.id);
                assert.isString(responseBody.slug);
                assert.equal(responseBody.by, story.by);
                assert.isNumber(responseBody.views);
                assert.equal(responseBody.publishedAt,moment().toDate());
                assert.equal(responseBody.createdAt,moment().toDate());
                assert.equal(responseBody.cards[0].mediaUri, story.cards[0].mediaUri);
                assert.equal(responseBody.cards[0].mediaType, story.cards[0].mediaType);
                assert.equal(responseBody.cards[0].externalLink, story.cards[0].externalLink);
                assert.isNumber(responseBody.cards[0].id);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates new story through ROMANS's account.", () => {
            return server.inject({
                method: 'POST', url: '/user/story',
                headers: { "authorization": romansJwt },
                payload: Utils.getStoryDummy()
            }).then((res: any) => {
                assert.equal(403, res.statusCode);
                Promise.resolve();
            });
        });

        describe('Sends invalid data in the payload.', () => {

            it('Invalid story-title.', () => {
                let story = Utils.getStoryDummy();
                story.title = 123;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Invalid story-author.', () => {
                let story: any = Utils.getStoryDummy();
                story.by = 123;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

            it('Invalid mediaUri of the card.', () => {
                let story: any = Utils.getStoryDummy();
                story.cards[0].mediaUri = "google[dot]com";
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Invalid mediaType of the card.', () => {
                let story: any = Utils.getStoryDummy();
                story.cards[0].mediaType = "picture"
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Invalid externalLink of the card.', () => {
                let story: any = Utils.getStoryDummy();
                story.cards[0].externalLink = "google[dot]com"
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

        });

        describe('Sends missing data in the payload.', () => {

            it('Missing story-title.', () => {
                let story = Utils.getStoryDummy();
                delete story.title;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing story-author.', () => {
                let story = Utils.getStoryDummy();
                delete story.by;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

            it('Missing mediaUri of the card.', () => {
                let story = Utils.getStoryDummy();
                delete story.cards[0].mediaUri;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing mediaType of the card.', () => {
                let story = Utils.getStoryDummy();
                delete story.cards[0].mediaType;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing externalLink of the card.', () => {
                let story = Utils.getStoryDummy();
                delete story.cards[0].externalLink;
                return server.inject({
                    method: 'POST',
                    url: '/user/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });

            });

        });
    });

    // describe("Tests for getting download CSV link.", () => {

    //     it("Gets download CSV link through GOD's account.", () => {
    //         return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": godJwt } }).then((res: any) => {
    //             let responseBody: any = JSON.parse(res.payload);
    //             responseBody.should.have.property('link');
    //             const csvlink = url.parse(responseBody.link);
    //             const jwt: string = csvlink.query.split('jwt=').pop();
    //             assert.isString(jwt);
    //             assert.equal(200, res.statusCode);
    //             Promise.resolve();
    //         });
    //     });

    //     it("Gets download CSV link through ROMANS's account.", () => {
    //         return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": romansJwt } }).then((res: any) => {
    //             assert.equal(403, res.statusCode);
    //             Promise.resolve();
    //         });
    //     });
    // });

    // describe("Tests for downloading the users CSV.", () => {

    //     it("Downloads users CSV with a valid JWT.", () => {
    //         return Utils.getCsvJwt().then((jwt: string) => {
    //             return server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res: any) => {
    //                 let responseHeader: any = res.headers;
    //                 assert.equal(responseHeader["content-type"], "text/csv; charset=utf-8");
    //                 assert.equal(200, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });

    //     it("Downloads users CSV with a invalid JWT.", () => {
    //         const jwt: string = "jwt=dummyjwt";
    //         return server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res: any) => {
    //             assert.equal(400, res.statusCode);
    //             Promise.resolve();
    //         });
    //     });

    //     it("Downloads users CSV with an expired JWT.", () => {
    //         return Utils.getCsvJwt().then((jwt: string) => {
    //             return new Promise((resolve, reject) => setTimeout(() => {
    //                 resolve();
    //             }, 1100)).then(() => {
    //                 return (server.inject({ method: 'GET', url: '/user/downloadCsv?' + jwt }).then((res: any) => {
    //                     assert.equal(400, res.statusCode);
    //                     Promise.resolve();
    //                 }));
    //             });
    //         });
    //     });
    // });

    // describe("Tests for getting user info in paginated fashion.", () => {
    //     it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
    //         return Utils.checkEndpointAccess('GET', '/user?page=6&size=3').then((res: any) => {
    //             assert.equal(res.romans, false);
    //             assert.equal(res.god, true);
    //             assert.equal(res.jesus, true);
    //             Promise.resolve();
    //         });
    //     });

    //     it("Gets user info by sending valid query params.", () => {
    //         return Utils.createSeedUserData().then((res: any) => {
    //             return server.inject({
    //                 method: 'GET',
    //                 url: '/user?page=0&size=3',
    //                 headers: { "authorization": godJwt }
    //             }).then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 let counter: number = 1;
    //                 responseBody.users.forEach((element: any) => {
    //                     assert.equal(element.name, "Dummy Jones");
    //                     assert.equal(element.email, `user${counter}@mail.com`);
    //                     counter++;
    //                 });
    //                 assert.isArray(responseBody.users);
    //                 assert.equal(200, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });

    //     it("Gets user info by sending invalid size in query params.", () => {
    //         return server.inject({ method: 'GET', url: '/user?page=6&size=3a', headers: { "authorization": godJwt } })
    //             .then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 assert.equal(400, res.statusCode);
    //                 Promise.resolve();
    //             });
    //     });

    //     it("Gets user info by sending invalid page in query params.", () => {
    //         return server.inject({ method: 'GET', url: '/user?page=6a&size=3', headers: { "authorization": godJwt } })
    //             .then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 assert.equal(400, res.statusCode);
    //                 Promise.resolve();
    //             });
    //     });

    //     describe('Sends missing data in the payload.', () => {
    //         it("Missing size.", () => {
    //             return server.inject({ method: 'GET', url: '/user?page=6', headers: { "authorization": godJwt } }).then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 assert.equal(400, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });

    //         it("Missing page.", () => {
    //             return server.inject({ method: 'GET', url: '/user?size=3', headers: { "authorization": godJwt } }).then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 assert.equal(400, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });
    // });

    // describe("Tests for getting info of a user from userId.", () => {
    //     it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
    //         return Utils.checkEndpointAccess('GET', '/user/1').then((res: any) => {
    //             assert.equal(res.romans, false);
    //             assert.equal(res.god, true);
    //             assert.equal(res.jesus, true);
    //             Promise.resolve();
    //         });
    //     });

    //     it("Gets info of an existing user.", () => {
    //         return Utils.createUserDummy().then((user: any) => {
    //             return server.inject({
    //                 method: 'GET',
    //                 url: `/user/${user.id}`,
    //                 headers: { "authorization": godJwt }
    //             }).then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 let userinfo: any = responseBody.user;
    //                 assert.equal(user.id, userinfo.id);
    //                 assert.equal(user.name, userinfo.name);
    //                 assert.equal(200, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });

    //     it("Gets info of a non-existant user.", () => {
    //         return server.inject({ method: 'GET', url: '/user/-1', headers: { "authorization": godJwt } }).then((res: any) => {
    //             let responseBody: any = JSON.parse(res.payload);
    //             assert.equal(404, res.statusCode);
    //             Promise.resolve();
    //         });
    //     });
    // });
});