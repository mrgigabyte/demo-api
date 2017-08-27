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

describe('Tests for non-admin-panel stories related endpoints.', () => {

    before(() => {
        server = Utils.getServerInstance();
        return Utils.getRoleBasedjwt('romans').then((jwt: string) => {
            romansJwt = jwt;
            return Utils.getRoleBasedjwt('god').then((jwt: string) => {
                godJwt = jwt;
                Promise.resolve();
            });
        });
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for marking story as read. ", () => {

        it("Marks an existing, published story as read.", () => {
            return Utils.createStory(godJwt).then((story: any) => {
                return Utils.publishStory(godJwt, story.id).then((res) => {
                    return server.inject({
                        method: 'POST',
                        url: `/story/${story.id}/markRead`,
                        headers: { "authorization": romansJwt }
                    }).then((res: any) => {
                        console.log(res);
                        let responseBody: any = JSON.parse(res.payload);
                        responseBody.should.have.property('read');
                        assert.equal(responseBody.read, true);
                        assert.equal(201, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });

        it("Marks an existing, non-published story as read.", () => {
            return Utils.createStory().then((story: any) => {
                return server.inject({
                    method: 'POST',
                    url: `/story/${story.id}/markRead`,
                    headers: { "authorization": romansJwt }
                }).then((res: any) => {
                    assert.equal(404, res.statusCode);
                    Promise.resolve();
                });
            });
        });

        it("Sends invalid or non existant id of a story in the payload.", () => {
            let storyId = "dummyId";
            return server.inject({
                method: 'POST',
                url: `/story/${storyId}/markRead`,
                headers: { "authorization": romansJwt }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for getting latest stories for the user. ", () => {

        it("Gets the latest stories, if the stories have been published.", () => {
            return Utils.createSeedStoryData(godJwt).then((stories: any) => {
                var promises = [];
                for (var i = 0; i < stories.length; ++i) {
                    promises.push(Utils.publishStory(godJwt, stories[i].id));
                }
                return Promise.all(promises).then((res:any) => {
                    return server.inject({
                        method: 'GET',
                        url: `/story/latest`,
                        headers: { "authorization": romansJwt }
                    }).then((res: any) => {
                        let responseBody: any = JSON.parse(res.payload).latest;
                        console.log(res);
                        assert.equal(responseBody.length, 2);
                        responseBody.forEach(function (responseStory) {
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

        it("Gets the latest stories, if none of the stories are published.", () => {
            return server.inject({
                method: 'GET',
                url: `/story/latest`,
                headers: { "authorization": romansJwt }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });

});