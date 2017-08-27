import * as chai from "chai";
import * as Hapi from 'hapi';
import * as Utils from "../utils";

const assert: Chai.Assert = chai.assert;
const should: Chai.Should = chai.should();
let server: Hapi.Server;
let romansJwt: string;
let godJwt: string;

describe('Tests for cards related endpoints.', () => {

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

    describe("Tests for changing the favourite state of the card. ", () => {

        it("Favourites/Unfavourites an existing card", () => {
            return Utils.createStory(godJwt).then((story: any) => {
                return Utils.publishStory(godJwt, story.id).then((res) => {
                    return server.inject({
                        method: 'POST',
                        url: `/card/${story.cards[0].id}/favourite`,
                        headers: { "authorization": romansJwt }
                    }).then((res: any) => {
                        console.log(res);
                        let responseBody: any = JSON.parse(res.payload);
                        responseBody.should.have.property('favourited');
                        assert.equal(responseBody.favourited, true);
                        assert.equal(201, res.statusCode);
                        Promise.resolve();
                    });
                });
            });
        });

        it("Sends id of a non-existing card in the payload.", () => {
            let cardId: number = 1;
            return server.inject({
                method: 'POST',
                url: `/card/${cardId}/favourite`,
                headers: { "authorization": romansJwt }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });

        it("Sends invalid of the card in the payload.", () => {
            let cardId = "dummyId";
            return server.inject({
                method: 'POST',
                url: `/card/${cardId}/favourite`,
                headers: { "authorization": romansJwt }
            }).then((res: any) => {
                assert.equal(400, res.statusCode);
                Promise.resolve();
            });
        });
    });

    describe("Tests for gettng all the cards marked as favourite by a user. ", () => {

        it("Checks if GOD, JESUS & ROMANS can access the endpoint.", () => {
            return Utils.checkEndpointAccess('GET', '/card/favourite').then((res: any) => {
                assert.equal(res.romans, true);
                assert.equal(res.god, true);
                assert.equal(res.jesus, true);
                Promise.resolve();
            });
        });

        it("Gets all the cards marked as favourite, when the stories exist", () => {
            return Utils.createStory(godJwt).then((story: any) => {
                return Utils.publishStory(godJwt, story.id).then(() => {
                    return Utils.markFavouriteCard(romansJwt, story.cards[0].id).then(() => {
                        return server.inject({
                            method: 'GET',
                            url: '/card/favourite',
                            headers: { "authorization": romansJwt }
                        }).then((res: any) => {
                            let responseBody: any = JSON.parse(res.payload);
                            for (let i = 0; i < story.cards.length; i++) {
                                if (responseBody.cards[i].id === story.cards[i].id) {
                                    Utils.validateCardResponse(responseBody, story);
                                }
                            }
                            assert.equal(200, res.statusCode);
                            Promise.resolve();
                        });
                    });
                });
            });
        });

        it("Gets all the cards marked as favourite, when the stories dont exist", () => {
            return server.inject({
                method: 'GET',
                url: `/card/favourite`,
                headers: { "authorization": romansJwt }
            }).then((res: any) => {
                let responseBody: any = JSON.parse(res.payload);
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });
});