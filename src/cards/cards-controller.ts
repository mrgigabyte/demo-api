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

    // Helper function to generate UIDs
// public generateUID() {
//     // I generate the UID from two parts here 
//     // to ensure the random number provide enough bits.
//     let firstPart = ((Math.random() * 46656) | 0).toString(36);
//     let secondPart = ((Math.random() * 46656) | 0).toString(36);
//     firstPart = ("000" + firstPart).slice(-3);
//     secondPart = ("000" + secondPart).slice(-3);
//     return firstPart + secondPart;
// }

    public uploadCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
//     let gcs = GoogleCloudStorage({
//         projectId: this.configs.googleCloud.projectId,
//         keyFilename: __dirname + '/../' + this.configs.googleCloud.keyFilename
//     });

//     let bucket = gcs.bucket(this.configs.googleCloud.assignmentsBucket);

//     var fileData = request.payload.file;
//     if (fileData) {
//         let dir = request.userId + '/' + request.params.courseId + '/' + request.params.exerciseId;
//         let name = this.generateUID() + '.' + fileData.hapi.filename;
//         let filePath = dir + '/' + name;
//         let file = bucket.file(filePath);

//         let stream = file.createWriteStream({
//             metadata: {
//                 contentType: fileData.hapi.headers['content-type']
//             }
//         });

//         stream.on('error', (err) => {
//             console.log(err);
//             return reply(Boom.badImplementation("There was some problem uploading the file. Please try again."));
//         });
//         stream.on('finish', () => {
//             return reply({
//                 "success": true,
//                 "filePath": "https://storage.googleapis.com/" + this.configs.googleCloud.assignmentsBucket + '/' + filePath
//             });
//         });

//         stream.end(fileData._data);
//     }
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

