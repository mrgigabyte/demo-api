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

    describe("Tests for marking story as read. ", () => {

        it("Favourites/Unfavourites an existing card", () => {
            return Utils.createStory(godJwt).then((story: any) => {
                return Utils.publishStory(godJwt,story.id).then((res) => {
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

        it("Sends invalid or non existant id of the card in the payload.", () => {
            let cardId = "dummyId";
            return server.inject({
                method: 'POST',
                url: `/card/${cardId}/favourite`,
                headers: { "authorization": romansJwt }
            }).then((res: any) => {
                assert.equal(404, res.statusCode);
                Promise.resolve();
            });
        });
    });

});