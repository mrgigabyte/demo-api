import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";

import { IServerConfigurations } from "../config";


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
                "mediaType": "image",
                "mediaUri": "https://wwww.loremipsum.com",
                "externalLink": "https://wwww.loremipsum.com",
                "favourite": "true"
            },
            {
                "id": 2,
                "order": 2,
                "mediaType": "image",
                "mediaUri": "https://wwww.loremipsum.com",
                "externalLink": "https://wwww.loremipsum.com",
                "favourite": "true"
            },
            {
                "id": 3,
                "order": 3,
                "mediaType": "video",
                "mediaUri": "https://wwww.loremipsum.com",
                "favourite": "true"
            }
        ];
    }

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

