// import * as chai from "chai";
// import * as Hapi from 'hapi';
// import * as Utils from "../utils";
// import * as streamToPromise from "stream-to-promise";
// import * as FormData from 'form-data';
// import * as fs from 'fs';

// const assert: Chai.Assert = chai.assert;
// const should: Chai.Should = chai.should();
// let server: Hapi.Server;
// let jwts: any = {};
// let largeImage = "https://goo.gl/7cqp1d";

// describe('Tests for admin-panel cards related endpoints.', function () {
//     this.timeout(10000000);

//     before(function () {
//         this.timeout(15000); //increases the default timeout from 2000ms to 15000ms
//         server = Utils.getServerInstance();
//         return Utils.clearDatabase().then(() => {
//             return Utils.clearUser().then(() => {
//                 return Utils.getRoleBasedjwt('romans').then((jwt: string) => {
//                     jwts.romans = jwt;
//                     return Utils.getRoleBasedjwt('god').then((jwt: string) => {
//                         jwts.god = jwt;
//                         return Utils.getRoleBasedjwt('jesus').then((jwt: string) => {
//                             jwts.jesus = jwt;
//                             Promise.resolve();
//                         });
//                     });
//                 });
//             });
//         });
//     });

//     after(() => {
//         return Utils.clearUser().then(() => {
//             Promise.resolve();
//         });
//     });

//     afterEach(() => {
//         return Utils.clearDatabase().then(() => {
//             Promise.resolve();
//         });
//     });

//     describe("Tests for uploading a new cards from the file system to Google Cloud storage ", () => {
//         it("Uploads an image of size less than 100mbs", () => {

//             // Utils.downloadFile("https://goo.gl/pmBDmn", "test.png", function () {
//             // let fileStream = fs.createReadStream('test.png');
//             let payload = {
//                 file: fs.readFileSync('../../test.png')
//             };
//             console.log(payload)
//             return server.inject({
//                 method: 'POST',
//                 url: '/card/mediaUpload',
//                 payload: payload,
//                 headers: { 'Content-Type': 'multipart/form-data',"authorization": jwts.god }
//             }).then((res) => {
//                 // console.log(res);
//                 Utils.deleteFile("test.jpg", function () { })
//                 Promise.resolve();
//             });



//             // });
//         });

//         // it("Uploads an image of size less more than 100mbs", () => {
//         //     return Utils.createStory(jwts.god).then((story: any) => {
//         //         return Utils.publishStory(story.id).then(() => {
//         //             return server.inject({
//         //                 method: 'POST',
//         //                 url: `/card/${story.cards[0].id}/favourite`,
//         //                 headers: { "authorization": jwts.romans }
//         //             }).then((res: any) => {
//         //                 let responseBody: any = JSON.parse(res.payload);
//         //                 responseBody.should.have.property('favourited');
//         //                 assert.equal(responseBody.favourited, true);
//         //                 assert.equal(200, res.statusCode);
//         //                 Promise.resolve();
//         //             });
//         //         });
//         //     });
//         // });

//         // it("Uploads a video of less than 100mbs", () => {
//         //     let cardId: number = 1;
//         //     return server.inject({
//         //         method: 'POST',
//         //         url: `/card/${cardId}/favourite`,
//         //         headers: { "authorization": jwts.romans }
//         //     }).then((res: any) => {
//         //         assert.equal(404, res.statusCode);
//         //         Promise.resolve();
//         //     });
//         // });

//         // it("Uploads a video of more than 100mbs", () => {
//         //     let cardId = "dummyId";
//         //     return server.inject({
//         //         method: 'POST',
//         //         url: `/card/${cardId}/favourite`,
//         //         headers: { "authorization": jwts.romans }
//         //     }).then((res: any) => {
//         //         assert.equal(400, res.statusCode);
//         //         Promise.resolve();
//         //     });
//         // });

//         // it("Uploads a file of wrong format", () => {
//         //     return Utils.createStory(jwts.god).then((story: any) => {
//         //         return Utils.publishStory(story.id).then(() => {
//         //             return server.inject({
//         //                 method: 'POST',
//         //                 url: `/card/${story.cards[0].id}/favourite`,
//         //                 headers: { "authorization": jwts.romans }
//         //             }).then((res: any) => {
//         //                 let responseBody: any = JSON.parse(res.payload);
//         //                 responseBody.should.have.property('favourited');
//         //                 assert.equal(responseBody.favourited, true);
//         //                 assert.equal(200, res.statusCode);
//         //                 Promise.resolve();
//         //             });
//         //         });
//         //     });
//         // });
//     });

//     describe("Tests for gettng all the cards marked as favourite by a user. ", () => {
//         it("Checks if GOD, JESUS & ROMANS can access the endpoint.", () => {
//             return Utils.checkEndpointAccess(jwts, 'GET', '/card/favourite').then((res: any) => {
//                 assert.equal(res.romans, true);
//                 assert.equal(res.god, true);
//                 assert.equal(res.jesus, true);
//                 Promise.resolve();
//             });
//         });

//         it("Gets all the cards marked as favourite, when the stories exist", () => {
//             return Utils.createStory(jwts.god).then((story: any) => {
//                 return Utils.publishStory(story.id).then(() => {
//                     return Utils.markFavouriteCard("romans@mail.com", story.cards[0].id).then(() => {
//                         return server.inject({
//                             method: 'GET',
//                             url: '/card/favourite',
//                             headers: { "authorization": jwts.romans }
//                         }).then((res: any) => {
//                             let responseBody: any = JSON.parse(res.payload);
//                             // validates the entire response
//                             for (let i = 0; i < responseBody.cards.length; i++) {
//                                 if (responseBody.cards[i].id === story.cards[i].id) {
//                                     Utils.validateCardResponse(responseBody, story);
//                                 }
//                             }
//                             assert.equal(200, res.statusCode);
//                             Promise.resolve();
//                         });
//                     });
//                 });
//             });
//         });

//         it("Gets all the cards marked as favourite, when the stories dont exist", () => {
//             return server.inject({
//                 method: 'GET',
//                 url: `/card/favourite`,
//                 headers: { "authorization": jwts.romans }
//             }).then((res: any) => {
//                 let responseBody: any = JSON.parse(res.payload);
//                 assert.equal(404, res.statusCode);
//                 Promise.resolve();
//             });
//         });
//     });
// });