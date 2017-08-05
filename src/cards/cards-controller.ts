import * as Hapi from "hapi";
import * as Boom from "boom";
import * as zen from 'zencoder';
import { IDb } from "../config";
import { IServerConfigurations } from "../config";

export default class CardController {

    private configs: IServerConfigurations;
    private database: IDb;

    constructor(configs: IServerConfigurations, database: IDb) {
        this.database = database;
        this.configs = configs;
    }

    public favourite(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let userId: number = request.auth.credentials.userId;
        let cardId: number = +request.params.cardId;
        this.database.card.findById(cardId).then((card: any) => {
            if (card) {
                card.toggleFav(userId, this.database.user).then((res: boolean) => {
                    return reply({
                        "favourited": res 
                    });
                });
            }
            else {
                return reply(Boom.notFound('Card not found.'));
            }
        }).catch((err)=>{
            console.log(err);
            return reply(Boom.expectationFailed(err));
        });
    }

    public getFavouriteCards(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let userId: number = request.auth.credentials.userId;
        this.database.user.findById(userId).then((user: any)=>{
            user.getFavouriteCards(this.database.card).then((cards: Array<any>)=>{
                return reply({
                       "cards": cards
                 });
            }).catch((err)=>{
                console.log(err);
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

