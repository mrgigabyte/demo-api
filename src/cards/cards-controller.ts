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
                "externalLink": "https://wwww.loremipsum.com"
            },
            {
                "id": 2,
                "order": 2,
                "mediaType": "image",
                "mediaUri": "https://wwww.loremipsum.com",
                "externalLink": "https://wwww.loremipsum.com"
            },
            {
                "id": 3,
                "order": 3,
                "mediaType": "video",
                "mediaUri": "https://wwww.loremipsum.com"
            }
        ];
    }

    public favourite(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // console.log(r,request.params.cardId);
        let userId = request.auth.credentials.userId;
        let cardId = request.params.cardId;
        this.database.card.findById(cardId).then((card)=>{
            // console.log(card);
            if(card){
               console.log('ok');
               card.toggleFav(userId,this.database.user);
            }
            else{
                console.log('Nope this isnt');
            }
        });
        // this.database.card.toggleFav(request.auth.credentials.userId,request.params.cardId, this.database.user);
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

    public uploadCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
        if (this.imageFilter(request.payload.file.hapi.filename)) {
            let fileData = request.payload.file;
            this.database.card.uploadCard(fileData, this.configs.googleCloud).then((res) => {
                return reply(res).code(201);
            }).catch((err) => {
                return reply(Boom.expectationFailed(err));
            });

        } else {
            return reply(Boom.badRequest('File type not supported'));
        }
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

