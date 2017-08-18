import * as Hapi from "hapi";
import * as Boom from "boom";
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
                return card.toggleFav(userId, this.database.user);
            }
            else {
                return reply(Boom.notFound('Card not found.'));
            }
        }).then((res: boolean) => {
            return reply({
                "favourited": res
            });
        }).catch(err => reply(err));
    }

    public getFavouriteCards(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let userId: number = request.auth.credentials.userId;
        this.database.user.findById(userId).then((user: any) => {
            return user.getFavouriteCards(this.database.card);
        }).then((cards: Array<any>) => {
            return reply({
                "cards": cards
            });
        }).catch(err => reply(err));
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
        let fileData = request.payload.file;
        let fileName = request.payload.file.hapi.filename;
        if (this.imageFilter(fileName)) {
            mediaType = 'image';
            this.database.card.uploadCard(fileData, this.configs.googleCloud).then((res: any) => {
                return reply({
                    "mediaUri": res.gcsLink,
                    "mediaType": mediaType,
                    "isQueued": false
                }).code(201);
            }).catch(err => reply(err));
        } else if (this.videoFilter(fileName)) {
            mediaType = 'video';
            this.database.card.uploadCard(fileData, this.configs.googleCloud).then((res: any) => {
                this.database.card.encodeVideo( // begins the encoding process.
                    res.gcsLink, res.fileName, this.configs.zenCoderApiKey, this.configs.googleCloud.encodedVideoBucket)
                    .then((id: number) => {
                        return reply({
                            "jobId": id,
                            "mediaType": mediaType,
                            "isQueued": true
                        }).code(202);
                    });
            }).catch(err => reply(err));
        } else {
            return reply(Boom.badRequest('File type not supported'));
        }
    }

    public checkEncodingStatus(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.card.checkJobStatus(request.query.jobId, this.configs.zenCoderApiKey).then((res: any) => {
            if (!res.encoded) {
                return reply(res).code(202);
            } else {
                return reply(res);
            }
        }).catch((err) => {
            if (err.code === 404) {
                return reply(Boom.notFound('Job with the given id not found.'));
            } else {
                return reply(err);
            }
        });
    }
}

