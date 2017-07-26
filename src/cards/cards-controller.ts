import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";

import { IServerConfigurations } from "../configurations";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;
    private dummyCards: any;

    constructor(configs: IServerConfigurations, database: any) {
        this.database = database;
        this.configs = configs;
        this.dummyCards = [
            {
                "id": 1,
                "order": 1,
                "cardType": "image",
                "cardData": "https://wwww.loremipsum.com",
                "link": "https://wwww.loremipsum.com",
                "linkType": "video",
                "favourite": "true"
            },
            {
                "id": 2,
                "order": 2,
                "cardType": "image",
                "cardData": "https://wwww.loremipsum.com",
                "link": "https://wwww.loremipsum.com",
                "linkType": "basic",
                "favourite": "true"
            },
            {
                "id": 3,
                "order": 3,
                "cardType": "video",
                "cardData": "https://wwww.loremipsum.com",
                "favourite": "true"
            }
        ];
    }

    // public try(request: Hapi.Request, reply: Hapi.Base_Reply) {
    //     // console.log(this.database);
    //     const a = this.database.user.build({
    //         email: "vidur@navvv",
    //         name: "vidur singla",
    //         profilePicture: "dasas",
    //         googleUserId: 1234,
    //         facilitator: 1
    //     });
    //     a.save().then((res) => {
    //         console.log('very good');
    //         return reply(res);
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // }

    public favourite(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "success": true
        });
    }

    public getFavouriteCards(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "data": this.dummyCards
        });
    }

    public uploadCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "link": "https://wwww.lorempIpsum.com"
        });
    }

    public addLink(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "added": true
        });
    }

    public deleteCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "deleted": true
        });
    }
}

