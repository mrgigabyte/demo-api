import * as chai from "chai";
import * as config from '../../src/config';
import * as Hapi from 'hapi';
import * as Utils from "../utils";

const assert: Chai.Assert = chai.assert;
const should: Chai.Should = chai.should();
let server: Hapi.Server;
let romansJwt: string;
let godJwt: string;
let jesusJwt: string;

describe('Tests for admin-panel stories related endpoints.', () => {

    before(() => {
        server = Utils.getServerInstance();
        return Utils.getRoleBasedjwt('romans').then((jwt: string) => {
            romansJwt = jwt;
            return Utils.getRoleBasedjwt('god').then((jwt: string) => {
                godJwt = jwt;
                return Utils.getRoleBasedjwt('jesus').then((jwt: string) => {
                    jesusJwt = jwt;
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
            let story: any = Utils.getStoryDummy();
            return server.inject({
                method: 'POST', url: '/story',
                headers: { "authorization": godJwt },
                payload: story
            }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload).story;
                Utils.validateStoryResponse(responseBody, story);
                assert.equal(201, res.statusCode);
                Promise.resolve();
            });
        });

        it("Creates new story through ROMANS's account.", () => {
            return server.inject({
                method: 'POST', url: '/story',
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
                    url: '/story',
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
                    url: '/story',
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
                    url: '/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Invalid mediaType of the card.', () => {
                let story: any = Utils.getStoryDummy();
                story.cards[0].mediaType = "picture";
                return server.inject({
                    method: 'POST',
                    url: '/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Invalid externalLink of the card.', () => {
                let story: any = Utils.getStoryDummy();
                story.cards[0].externalLink = "google[dot]com";
                return server.inject({
                    method: 'POST',
                    url: '/story',
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
                    url: '/story',
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
                    url: '/story',
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
                    url: '/story',
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
                    url: '/story',
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

        });
    });

    describe("Tests for updating details of a previously published/draft story.", () => {

        it("Updates a story, adds a new card through GOD's account.", () => {
            return Utils.createStory().then((story: any) => {
                let storyId = story.id;
                let newCard: any = {
                    mediaUri: "http://www.newcard.org/image/test.wav",
                    mediaType: "video"
                };
                let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                Object.keys(story).forEach(function (x: any) {
                    if (dummyStory.indexOf(x) === -1) {
                        delete story[x];
                    }
                });
                story.cards.push(newCard);
                return server.inject({
                    method: 'PUT', url: `/story/${storyId}`,
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload).story;
                    Utils.validateStoryResponse(responseBody, story);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Updates a story, updates story title, author and an existing card through GOD's account.", () => {
            return Utils.createStory().then((story: any) => {
                let UpdatedStory = {
                    title: "Updated Dummy Artifact to Human Communication",
                    by: "John Doe",
                    cards: [
                        {
                            id: story.cards[0].id,
                            mediaUri: "http://www.Updateddummy.org/image/test.jpg",
                            mediaType: "video",
                            externalLink: "http://www.externallike.org"
                        },
                        {
                            id: story.cards[1].id,
                            mediaUri: "http://www.Updateddummy.org/image/test11.jpg",
                            mediaType: "image",
                            externalLink: "http://www.externallike.org"
                        }
                    ]
                };
                return server.inject({
                    method: 'PUT', url: `/story/${story.id}`,
                    headers: { "authorization": godJwt },
                    payload: UpdatedStory
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload).story;
                    Utils.validateStoryResponse(responseBody, UpdatedStory);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Updates a story, removes all the existing cards through GOD's account.", () => {
            return Utils.createStory().then((story: any) => {
                story.cards = [];
                let storyId = story.id;
                let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                Object.keys(story).forEach(function (x: any) {
                    if (dummyStory.indexOf(x) === -1) {
                        delete story[x];
                    }
                });
                return server.inject({
                    method: 'PUT', url: `/story/${storyId}`,
                    headers: { "authorization": godJwt },
                    payload: story
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload).story;
                    Utils.validateStoryResponse(responseBody, story);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Updates a story through ROMAN's account.", () => {
            return Utils.createStory().then((story: any) => {
                let UpdatedStory = {
                    title: "Updated Dummy Artifact to Human Communication",
                    by: "John Doe",
                    cards: [
                        {
                            id: story.cards[0].id,
                            mediaUri: "http://www.Updateddummy.org/image/test.jpg",
                            mediaType: "video",
                            externalLink: "http://www.externallike.org"
                        }
                    ]
                };
                return server.inject({
                    method: 'PUT', url: `/story/${story.id}`,
                    headers: { "authorization": romansJwt },
                    payload: UpdatedStory
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload).story;
                    assert.equal(403, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe('Sends invalid data in the payload.', () => {

            it('Invalid story-title.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    story.title = 123;
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Invalid story-author.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    story.by = 123;
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });

            });

            it('Invalid mediaUri of the card.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    story.cards[0].mediaUri = "google[dot]com";
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Invalid mediaType of the card.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    story.cards[0].mediaType = "picture";
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Invalid externalLink of the card.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    story.cards[0].externalLink = "google[dot]com";
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });

        describe('Sends missing data in the payload.', () => {

            it('Missing story-title.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    delete story.title;
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing story-author.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    delete story.by;
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing mediaUri of the card.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    delete story.cards[0].mediaUri;
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

            it('Missing mediaType of the card.', () => {
                return Utils.createStory().then((story: any) => {
                    let storyId = story.id;
                    let dummyStory: Array<any> = Object.keys(Utils.getStoryDummy());
                    Object.keys(story).forEach(function (x: any) {
                        if (dummyStory.indexOf(x) === -1) {
                            delete story[x];
                        }
                    });
                    delete story.cards[0].mediaType;
                    return server.inject({
                        method: 'PUT',
                        url: `/story/${storyId}`,
                        headers: { "authorization": godJwt },
                        payload: story
                    }).then((res: any) => {
                        assert.equal(400, res.statusCode);
                        Promise.resolve();
                    });
                });
            });

        });
    });

    describe("Tests for making a story live.", () => {

        it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
            return Utils.checkEndpointAccess('POST', '/story/3/pushLive').then((res: any) => {
                assert.equal(res.romans, false);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Makes an existing story live.", () => {
            return Utils.createStory().then((story: any) => {
                let storyId = story.id;
                return server.inject({
                    method: 'POST',
                    url: `/story/${storyId}/pushLive`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('pushed');
                    assert.equal(responseBody.pushed, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Sends invalid or non existant id of a story in the payload.", () => {
            let storyId = "dummyId";
            return server.inject({
                method: 'POST',
                url: `/story/${storyId}/pushLive`,
                headers: { "authorization": godJwt }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });

    // describe("Tests for sending a push notification of a story to GOD/JESUS. ", () => {

    //     it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
    //         return Utils.checkEndpointAccess('POST', '/story/3/preview').then((res: any) => {
    //             assert.equal(res.romans, false);
    //             assert.equal(res.god, true);
    //             assert.equal(res.jesus, true);
    //             Promise.resolve();
    //         });
    //     });

    //     it("Sends a push notification of an existing story.", () => {
    //         return Utils.createStory().then((story: any) => {
    //             let storyId = story.id;
    //             return server.inject({
    //                 method: 'POST',
    //                 url: `/story/${storyId}/preview`,
    //                 headers: { "authorization": godJwt }
    //             }).then((res: any) => {
    //                 let responseBody: any = JSON.parse(res.payload);
    //                 responseBody.should.have.property('success');
    //                 assert.equal(responseBody.success, true);
    //                 assert.equal(200, res.statusCode);
    //                 Promise.resolve();
    //             });
    //         });
    //     });

    //     it("Sends invalid or non existant id of a story in the payload.", () => {
    //         let storyId = "dummyId";
    //         return server.inject({
    //             method: 'POST',
    //             url: `/story/${storyId}/preview`,
    //             headers: { "authorization": godJwt }
    //         }).then((res: any) => {
    //             assert.equal(404, res.statusCode);
    //             Promise.resolve();
    //         });
    //     });
    // });

    describe("Tests for deleting a story and all the cards associated with the story. ", () => {

        it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
            return Utils.checkEndpointAccess('DELETE', '/story/3').then((res: any) => {
                assert.equal(res.romans, false);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Deletes an existing story.", () => {
            return Utils.createStory().then((story: any) => {
                let storyId = story.id;
                return server.inject({
                    method: 'DELETE',
                    url: `/story/${storyId}`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload);
                    responseBody.should.have.property('deleted');
                    assert.equal(responseBody.deleted, true);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Sends invalid or non existant id of a story in the payload.", () => {
            let storyId = "dummyId";
            return server.inject({
                method: 'DELETE',
                url: `/story/${storyId}`,
                headers: { "authorization": godJwt }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for getting story by id or slug. ", () => {

        it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
            return Utils.checkEndpointAccess('GET', '/story/3').then((res: any) => {
                assert.equal(res.romans, false);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Gets details of an existing story.", () => {
            return Utils.createStory().then((story: any) => {
                let storyId = story.id;
                return server.inject({ method: 'GET', url: `/story/${storyId}`, headers: { "authorization": godJwt } }).then((res: any) => {
                    let responseBody: any = JSON.parse(res.payload).story;
                    Utils.validateStoryResponse(responseBody, story);
                    assert.equal(200, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Sends invalid or non existant id of a story in the payload.", () => {
            let storyId = "dummyId";
            return server.inject({ method: 'GET', url: `/story/${storyId}`, headers: { "authorization": godJwt } }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for getting all the stories (published/draft) created so far. ", () => {

        it("Checks if GOD & JESUS can access the endpoint and ROMANS cant.", () => {
            return Utils.checkEndpointAccess('GET', '/story?page=0&size=3&type=published').then((res: any) => {
                assert.equal(res.romans, false);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Gets all the published stories", () => {
            return Utils.createSeedStoryData(godJwt).then((stories: any) => {
                var promises = [];
                for (var i = 0; i < stories.length; ++i) {
                    promises.push(Utils.publishStory(godJwt, stories[i].id));
                }
                return Promise.all(promises).then((res) => {
                    return server.inject({
                        method: 'GET',
                        url: `/story?page=0&size=3&type=published`,
                        headers: { "authorization": godJwt }
                    }).then((res: any) => {
                        let responseBody: any = JSON.parse(res.payload);
                        assert.isNumber(responseBody.noOfPages);
                        assert.isNumber(responseBody.currentPageNo);
                        responseBody.stories.forEach(function (responseStory) {
                            stories.forEach(function (story) {
                                if (responseStory.id === story.id) {
                                    Utils.validateStoryResponse(responseStory, story);
                                }
                            });
                        });
                        assert.equal(200, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });

        it("Gets all the draft stories.", () => {
            return Utils.createSeedStoryData(godJwt).then((stories: any) => {
                var promises = [];
                for (var i = 0; i < stories.length - 2; ++i) {
                    promises.push(Utils.publishStory(godJwt, stories[i].id));
                }
                return Promise.all(promises).then((res) => {
                    return server.inject({
                        method: 'GET',
                        url: `/story?page=0&size=3&type=published`,
                        headers: { "authorization": godJwt }
                    }).then((res: any) => {
                        let responseBody: any = JSON.parse(res.payload);
                        assert.isNumber(responseBody.noOfPages);
                        assert.isNumber(responseBody.currentPageNo);
                        responseBody.stories.forEach(function (responseStory) {
                            stories.forEach(function (story) {
                                if (responseStory.id === story.id) {
                                    Utils.validateStoryResponse(responseStory, story);
                                }
                            });
                        });
                        assert.equal(200, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });

        describe("Sends invalid data in the payload.", () => {

            it("Invalid page.", () => {
                return server.inject({
                    method: 'GET',
                    url: `/story?page=abc&size=3&type=published`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Invalid size.", () => {
                return server.inject({
                    method: 'GET',
                    url: `/story?page=0&size=abc&type=published`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it("Invalid type.", () => {
                return server.inject({
                    method: 'GET',
                    url: `/story?page=0&size=3&type=user`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        describe('Sends missing data in the payload.', () => {

            it('Missing page.', () => {
                return server.inject({
                    method: 'GET',
                    url: `/story?size=3&type=published`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing size.', () => {
                return server.inject({
                    method: 'GET',
                    url: `/story?page=0&type=published`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });

            it('Missing type.', () => {
                return server.inject({
                    method: 'GET',
                    url: `/story?page=0&size=3`,
                    headers: { "authorization": godJwt }
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });
});