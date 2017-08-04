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
    }

    public favourite(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let userId = request.auth.credentials.userId;
        let cardId = request.params.cardId;
        this.database.card.findById(cardId).then((card) => {
            if (card) {
                card.toggleFav(userId, this.database.user).then(() => {
                    return reply({
                        "success": true
                    });
                });
            }
            else {
                return reply(Boom.notFound('Card not found.'));
            }
        }).catch((err)=>{
            return reply(Boom.expectationFailed(err));
        });
    }

    public getFavouriteCards(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let userId = request.auth.credentials.userId;
        this.database.user.findById(userId).then((user)=>{
            user.getFavouriteCard().then((data)=>{
                console.log(data);
                return reply({
                       "data": data
                 });
            }).catch(()=>{
                return reply(Boom.notFound("User doesn't have any favourite card"));
            });
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

