import * as Hapi from "hapi";
import * as Boom from "boom";
import { IDb } from "../config";

import { IServerConfigurations } from "../config";


export default class UserController {

    private configs: IServerConfigurations;
    private database: IDb;
    private dummyStory1: any;
    private dummyStory2: any;
    private dummyStory3: any;

    constructor(configs: IServerConfigurations, database: IDb) {
        this.database = database;
        this.configs = configs;
        this.dummyStory1 = {
            "id": 1,
            "title": "Lorem Ipsum",
            "slug": "lorem-ipsum",
            "by": "Steven Harrington",
            "createdAt": "2017-07-22T07:15:13.250Z",
            "publishedAt": "2017-07-25T07:15:13.250Z",
            "views": "1000",
            "cards": [
                {
                    "id": 14,
                    "order": 1,
                    "cardType": "image",
                    "cardData": "https://wwww.loremipsum.com",
                    "link": "https://wwww.loremipsum.com",
                    "linkType": "video",
                    "favourite": "false"
                },
                {
                    "id": 27,
                    "order": 2,
                    "cardType": "image",
                    "cardData": "https://wwww.loremipsum.com",
                    "link": "https://wwww.loremipsum.com",
                    "linkType": "basic",
                    "favourite": "false"
                },
                {
                    "id": 31,
                    "order": 3,
                    "cardType": "video",
                    "cardData": "https://wwww.loremipsum.com",
                    "link": "https://wwww.loremipsum.com",
                    "linkType": "video",
                    "favourite": "false"
                },
                {
                    "id": 42,
                    "order": 4,
                    "cardType": "image",
                    "cardData": "https://wwww.loremipsum.com",
                    "favourite": "false"
                },
                {
                    "id": 51,
                    "order": 5,
                    "cardType": "image",
                    "cardData": "https://wwww.loremipsum.com",
                    "link": "https://wwww.loremipsum.com",
                    "linkType": "video",
                    "favourite": "false"
                }
            ]
        };

        this.dummyStory2 = {
            "id": 3,
            "title": "Lorem Ipsum and lorem Ipsum",
            "slug": "lorem-ipsum-and-lorem-ipsum",
            "by": "John Doe",
            "createdAt": "2017-07-21T07:15:13.250Z",
            "publishedAt": "2017-07-23T07:15:13.250Z",
            "views": "500",
            "cards": [
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
                    "favourite": "false"
                },
                {
                    "id": 3,
                    "order": 3,
                    "cardType": "video",
                    "cardData": "https://wwww.loremipsum.com",
                    "favourite": "false"
                }
            ]
        };

        this.dummyStory3 = {
            "id": 3,
            "title": "Lorem Ipsum and draft",
            "slug": "lorem-ipsum-and-draft",
            "by": "John Draft",
            "createdAt": "2017-07-25T07:15:13.250Z",
            "views": "0",
            "cards": [
                {
                    "id": 12,
                    "order": 1,
                    "cardType": "image",
                    "cardData": "https://wwww.loremipsum.com",
                    "link": "https://wwww.loremipsum.com",
                    "linkType": "video",
                    "favourite": "true"
                },
                {
                    "id": 22,
                    "order": 2,
                    "cardType": "image",
                    "cardData": "https://wwww.loremipsum.com",
                    "favourite": "false"
                }
            ]
        };
    }

    public getLatest(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // Task.findAll({ include: [ User ] }).then(tasks => {
        //   console.log(JSON.stringify(tasks))
        // this.database.story.findAll({
        //     order: [
        //         ['publishedAt', 'ASC'],
        //         [{ model: this.database.card }, 'order', 'ASC']
        //     ],
        //     where : {
        //         publishedAt: {
        //             $ne: null
        //         }
        //     },
        //     include : [{
        //         model: this.database.card,
        //         as: 'cards'
        //     }, {
        //         model: 'readStories'
        //     }]
        // })
        return reply({
            "data": [this.dummyStory1, this.dummyStory2]
        });
    }


    public getStoryByIdOrSlug(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug)
            .then((story) => {
                if (story) {
                    return reply({
                        "story": story.get({
                            plain: true
                        })
                    });
                } else {
                    reply(Boom.notFound("Story with give id or slug doesn't exist"));
                }
            });
    }

    public markRead(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug).then((story) => {
            if (story) {
                story.markRead(this.database, request.auth.credentials.userId).then((res) => {
                    return reply({
                        "read": true
                    });
                }).catch((err) => {
                    reply(Boom.conflict(err));
                });
            } else {
                reply(Boom.notFound("Story with give id or slug doesn't exist"));
            }
        });
    }

    public getArchived(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let tempStory1 = this.dummyStory1;
        let tempStory2 = this.dummyStory2;
        return reply({
            "data": [tempStory1, tempStory2, this.dummyStory1, this.dummyStory2]
        });
    }

    public getAllStories(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.unscoped().findAll({
            attributes: ['id', 'title', 'slug', 'by', 'createdAt', 'publishedAt'],
            include: [{
                model: this.database.user,
                attributes: ['id']
            }],
            nested: false,
            where: {
                deleted: false
            },
        }).then((stories: Array<any>) => {
            if (stories.length) {
                stories.forEach((story) => {
                    story.views = story.users.length;
                    story = story.get({
                        plain: true
                    });
                });
                return reply({
                    "data": stories
                });
            } else {
                reply(Boom.notFound('Stories not found.'));
            }
        });
        // let tempStory1 = this.dummyStory1;
        // let tempStory2 = this.dummyStory2;
        // return reply({
        //     "data": [tempStory1, tempStory2, this.dummyStory1, this.dummyStory3, this.dummyStory2]
        // });
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

    public addCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "success": true
        });
    }

    public newStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "success": true
        });
    }

    public updateStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "updated": true
        });
    }

    public pushLive(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "pushed": true
        });
    }
    public preview(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "success": true
        });
    }

    public deleteStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "deleted": true
        });
    }
}
