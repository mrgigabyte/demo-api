import * as chai from "chai";
import * as Hapi from 'hapi';
import * as Utils from "../utils";
import * as streamToPromise from "stream-to-promise";
import * as FormData from 'form-data';
import * as fs from 'fs';

const assert: Chai.Assert = chai.assert;
const should: Chai.Should = chai.should();
let server: Hapi.Server;
let jwts: any = {};

describe('Tests for admin-panel cards related endpoints.', function () {
    /*  timeout has been increased because it takes a while to download 
     *  all the test files.
     */
    this.timeout(100000);

    before(function () {
        server = Utils.getServerInstance();
        return Utils.clearDatabase().then(() => {
            return Utils.clearUser().then(() => {
                return Utils.getRoleBasedjwt('romans').then((jwt: string) => {
                    jwts.romans = jwt;
                    return Utils.getRoleBasedjwt('god').then((jwt: string) => {
                        jwts.god = jwt;
                        return Utils.getRoleBasedjwt('jesus').then((jwt: string) => {
                            jwts.jesus = jwt;
                            Promise.resolve();
                        });
                    });
                });
            });
        });
    });

    after(() => {
        return Utils.clearUser().then(() => {
            Promise.resolve();
        });
    });

    afterEach(() => {
        return Utils.clearDatabase().then(() => {
            Promise.resolve();
        });
    });

    describe("Tests for uploading a new cards from the file system(with size less than 100mbs) to Google Cloud storage ", () => {
        it("Uploads an image", () => {
            return Utils.downloadFile("https://goo.gl/roHYzG", "test.png").then(() => {
                return Utils.convertFileToForm('test.png').then((form: any) => {
                    let header = form.getHeaders();
                    header.authorization = jwts.god;
                    return streamToPromise(form).then(function (payload: any) {
                        return server.inject({
                            method: 'POST',
                            url: '/card/mediaUpload',
                            payload: payload,
                            headers: header
                        });
                    }).then((res: any) => {
                        let responseBody: any = JSON.parse(res.payload);
                        assert.isString(responseBody.mediaUri);
                        assert.equal(responseBody.mediaType, "image");
                        assert.equal(responseBody.isQueued, false);
                        return Utils.deleteFile('test.png').then(() => {
                            Promise.resolve();
                        });
                    });
                });
            });
        });

        it("Uploads a gif", () => {
            return Utils.downloadFile("https://goo.gl/CHstC4", "test.gif").then(() => {
                return Utils.convertFileToForm('test.gif').then((form: any) => {
                    let header = form.getHeaders();
                    header.authorization = jwts.god;
                    return streamToPromise(form).then(function (payload: any) {
                        return server.inject({
                            method: 'POST',
                            url: '/card/mediaUpload',
                            payload: payload,
                            headers: header
                        });
                    }).then((res: any) => {
                        let responseBody: any = JSON.parse(res.payload);
                        assert.isString(responseBody.mediaUri);
                        assert.equal(responseBody.mediaType, "image");
                        assert.equal(responseBody.isQueued, false);
                        return Utils.deleteFile('test.gif').then(() => {
                            Promise.resolve();
                        });
                    });
                });
            });
        });

        it("Uploads a video", () => {
            return Utils.downloadFile("https://goo.gl/Az7Nu6", "test.mp4").then(() => {
                return Utils.convertFileToForm('test.mp4').then((form: any) => {
                    let header = form.getHeaders();
                    header.authorization = jwts.god;
                    return streamToPromise(form).then(function (payload: any) {
                        return server.inject({
                            method: 'POST',
                            url: '/card/mediaUpload',
                            payload: payload,
                            headers: header
                        });
                    }).then((res: any) => {
                        let responseBody: any = JSON.parse(res.payload);
                        assert.isNumber(responseBody.jobId);
                        assert.equal(responseBody.mediaType, "video");
                        assert.equal(responseBody.isQueued, true);
                        return Utils.deleteFile('test.mp4').then(() => {
                            Promise.resolve();
                        });
                    });
                });
            });
        });

        it("Uploads a video using Roman's account", () => {
            return Utils.downloadFile("https://goo.gl/Az7Nu6", "test.mp4").then(() => {
                return Utils.convertFileToForm('test.mp4').then((form: any) => {
                    let header = form.getHeaders();
                    header.authorization = jwts.romans;
                    return streamToPromise(form).then(function (payload: any) {
                        return server.inject({
                            method: 'POST',
                            url: '/card/mediaUpload',
                            payload: payload,
                            headers: header
                        });
                    }).then((res: any) => {
                        assert.equal(403, res.statusCode);
                        return Utils.deleteFile('test.mp4').then(() => {
                            Promise.resolve();
                        });
                    });
                });
            });
        });

        it("Uploads a file of wrong format", () => {
            return Utils.convertFileToForm('README.md').then((form: any) => {
                let header = form.getHeaders();
                header.authorization = jwts.god;
                return streamToPromise(form).then(function (payload: any) {
                    return server.inject({
                        method: 'POST',
                        url: '/card/mediaUpload',
                        payload: payload,
                        headers: header
                    });
                }).then((res: any) => {
                    assert.equal(400, res.statusCode);
                    Promise.resolve();
                });
            });
        });
    });
});