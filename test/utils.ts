import * as chai from "chai";
import * as Configs from "../src/config";
import * as Database from '../src/models';
import * as Server from "../src/server";
import { IDb } from "../src/config";
import * as Hapi from 'hapi';
import * as url from 'url';
import * as moment from 'moment';
import * as fs from 'fs';
import * as request from 'request';

let database: IDb = Database.init(process.env.NODE_ENV);
const serverConfig = Configs.getServerConfigs();
const assert: Chai.Assert = chai.assert;
let server: Hapi.Server;
Server.init(serverConfig, database).then((Server: Hapi.Server) => {
    server = Server;
});

export function getUserDummy(email?: string, role?: string, password?: string, name?: string): any {
    let user = {
        email: email || "dummy123@mail.com",
        name: name || "Dummy Jones",
        password: password || "123123",
        role: role || 'romans'
    };

    if (!role) {
        delete user.role;
    }

    return user;
}

export function getStoryDummy(title?: string, author?: string,
    mediaUri?: string, mediaType?: string, externalLink?: string): any {
    let story = {
        title: title || "Dummy Artifact to Human Communication",
        by: author || "Dummy Jones",
        cards: [
            {
                mediaUri: mediaUri || "http://www.dummy.org/image/test1.jpg",
                mediaType: mediaType || "image",
                externalLink: externalLink || "http://www.externallink1.org"
            },
            {
                mediaUri: mediaUri || "http://www.dummy.org/image/test1.wav",
                mediaType: mediaType || "video",
                externalLink: externalLink || "http://www.externallink2.org"
            }
        ]
    };

    return story;
}

export function getStoryData(storyId?: number): Promise<any> {
    if (storyId) {
        return database.story.findOne({ where: { id: storyId } });
    }
    else {
        return database.story.findAll({ where: {} });
    }
}



export function downloadFile(uri, filename): Promise<any> {
    return new Promise((resolve, reject) => {
        request.head(uri, function (err, res, body) {
            return resolve(request(uri).pipe(fs.createWriteStream(filename)));
        });
    });
}

export function deleteFile(filename) {
    return new Promise((resolve, reject) => {
        fs.unlink(filename, function (err) {
            if (err) {
                return console.log(err);
            }
            resolve();
        });
    });
}


export function getResetPasswordDetails(code: string, email?: string): any {
    let user = {
        code: code,
        email: email || "dummy123@mail.com",
        password: "12223123"
    };

    return user;
}

export function getServerInstance(): any {
    return server;
}

export function clearDatabase(): Promise<any> {
    let promiseResetCodes: Promise<any> = database.resetCode.destroy({ where: {} });
    let promiseStory: Promise<any> = database.story.destroy({ where: {} });
    let promiseUser: Promise<any> = database.user.destroy({
        where: {
            email: { $notIn: ['god@mail.com', 'romans@mail.com', 'jesus@mail.com'] },
            status: { $in: ['deleted', 'active', 'inactive'] }
        }
    });
    return promiseResetCodes.then(() => {
        return promiseStory.then(() => {
            return promiseUser;
        });
    });
}

// deletes all the existing records from the users table
export function clearUser(): Promise<any> {
    return database.user.destroy({ where: {} });
}

export function validateStoryResponse(responseBody: any, story: any) {
    assert.equal(responseBody.title, story.title);
    assert.isNumber(responseBody.id);
    assert.isString(responseBody.slug);
    assert.equal(responseBody.by, story.by);
    assert.isString(responseBody.createdAt);
    if (responseBody.views) {
        assert.isNumber(responseBody.views);
    }
    if (responseBody.cards) {
        validateCardResponse(responseBody, story);
    }
}

// gets the status of the favourite card of the user with the given email and id of the card
export function getFavouriteCardStatus(email: string, cardId: string): Promise<any> {
    return database.user.findOne({ where: { email: email } }).then((user) => {
        return database.card.findOne({ where: { id: cardId } }).then((card) => {
            return user.hasCards(card);
        });
    });
}

// validates the cards key when the responseBody and the initial story is passed
export function validateCardResponse(responseBody: any, story: any) {
    for (let i = 0; i < responseBody.cards.length; i++) {
        assert.equal(responseBody.cards[i].mediaUri, story.cards[i].mediaUri);
        assert.equal(responseBody.cards[i].mediaType, story.cards[i].mediaType);
        assert.equal(responseBody.cards[i].externalLink, story.cards[i].externalLink);
        assert.isNumber(responseBody.cards[i].id);
    }
}


export function createUserDummy(email?: string, role?: string): Promise<any> {
    role = role || 'romans';
    return database.user.create(getUserDummy(email, role));
}

// gets the userinfo with given email id
export function getUserInfo(email: string): Promise<any> {
    return database.user.findOne({ where: { email: email } });
}

//access the create story endpoint and returns the instance
export function createStory(jwt: string, title?: string, author?: string,
    mediaUri?: string, mediaType?: string, externalLink?: string): Promise<any> {
    return server.inject({
        method: 'POST', url: '/story',
        headers: { "authorization": jwt },
        payload: getStoryDummy(title, author, mediaUri, mediaType, externalLink)
    }).then((res: any) => {
        let responseBody: any = JSON.parse(res.payload);
        return responseBody.story;
    });
}

//updates the publishAt field for the story with the given storyid
export function publishStory(storyId: number): Promise<any> {
    return database.story.findOne({
        where: {
            id: storyId
        }
    }).then((res: any) => {
        return res.update({ publishedAt: moment().toDate() });
    });
}

// generates the jwt for the role with the desired email id
export function getRoleBasedjwt(role: string, email?: string): Promise<string> {
    let user = {
        email: email || `${role}@mail.com`,
        password: getUserDummy().password
    };
    return createUserDummy(user.email, role).then(() => {
        return server.inject({ method: 'POST', url: '/user/login', payload: user }).then((res: any) => {
            let login: any = JSON.parse(res.payload);
            return login.jwt;

        });
    });
}

export function getResetCode(email: string): Promise<any> {
    return server.inject({ method: 'POST', url: '/user/requestResetPassword', payload: { email: email } });
}

export function getCsvJwt(jwt: string): Promise<any> {
    return server.inject({ method: 'GET', url: '/user/getCsvLink', headers: { "authorization": jwt } }).then((res: any) => {
        const jwt: any = JSON.parse(res.payload);
        const csvlink: string = url.parse(jwt.link).query;
        return csvlink;
    });
}

// sets the card as favourite for the user with the given email and id of the card
export function markFavouriteCard(email: string, cardId: string): Promise<any> {
    return database.user.findOne({ where: { email: email } }).then((user) => {
        return database.card.findOne({ where: { id: cardId } }).then((card) => {
            return user.hasCards(card).then((result) => {
                if (result) {
                    user.removeCards(card);
                    return Promise.resolve(false);
                } else {
                    user.addCards(card);
                    return Promise.resolve(true);
                }
            });
        });
    });
}

// tries accessing the given endpoint with all the three authorisation headers
export function checkEndpointAccess(jwts: any, httpMethod: string, httpUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
        let accessStatus = {
            romans: true,
            god: true,
            jesus: true
        };
        let PromiseRomans = server.inject({
            method: httpMethod,
            url: httpUrl,
            headers: { "authorization": jwts.romans }
        }).then((res: any) => {
            if (res.statusCode === 403) {
                accessStatus.romans = false;
            }
        });

        let PromiseGod = server.inject({
            method: httpMethod,
            url: httpUrl, headers: { "authorization": jwts.god }
        }).then((res: any) => {
            if (res.statusCode === 403) {
                accessStatus.god = false;
            }
        });

        let PromiseJesus = server.inject({
            method: httpMethod,
            url: httpUrl, headers: { "authorization": jwts.jesus }
        }).then((res: any) => {
            if (res.statusCode === 403) {
                accessStatus.jesus = false;
            }
        });

        Promise.all([PromiseRomans, PromiseGod, PromiseJesus]).then(() => {
            return resolve(accessStatus);
        });
    });
}

export function createSeedUserData(): Promise<any> {
    return Promise.all([
        createUserDummy("user1@mail.com"),
        createUserDummy("user2@mail.com"),
        createUserDummy("user3@mail.com"),
    ]);

}

export function createSeedStoryData(jwt: string): Promise<any> {
    return Promise.all([
        createStory(jwt, "Story 1"),
        createStory(jwt, "Story 2"),
        createStory(jwt, "Story 3"),
        createStory(jwt, "Story 4")
    ]);

}