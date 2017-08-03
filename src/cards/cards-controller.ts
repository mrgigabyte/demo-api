import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";
import * as zen from 'zencoder';

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

    public imageFilter(fileName: string) {
        if (!fileName.match(/\.(jpg|jpeg|png|gif)$/)) {
            return false;
        }
        return true;
    }

    public videoFilter(fileName: string) {
        if (!fileName.match(/\.(mp4)$/)) {
            return false;
        }
        return true;
    }

    public uploadCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let mediaType: string;
        if (this.imageFilter(request.payload.file.hapi.filename)) {
            mediaType = 'image';
        } else if (this.videoFilter(request.payload.file.hapi.filename)) {
            mediaType = 'video';
        } else {
            console.log('hey');
            return reply(Boom.badRequest('File type not supported'));
        }
        let fileData = request.payload.file;
        this.database.card.uploadCard(fileData, this.configs.googleCloud, mediaType).then((res) => {
            return reply(res).code(201);
        }).catch((err) => {
            return reply(Boom.expectationFailed(err));
        });
    }
}

