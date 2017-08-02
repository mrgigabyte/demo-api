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
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope')
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
        this.database.story.getStory(request.params.idOrSlug, 'notPublished').then((story) => {
            console.log(story);
            if (story) {
                story.markRead(this.database.user, request.auth.credentials.userId).then((res) => {
                    return reply({
                        "read": true
                    }).code(201);
                }).catch((err) => {
                    return reply(Boom.conflict(err));
                });
            } else {
                return reply(Boom.notFound("Story with give id or slug doesn't exist"));
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
        this.database.story.findAll({
            attributes: ['id', 'title', 'slug', 'by', 'createdAt', 'publishedAt'],
            include: [{
                model: this.database.user,
                attributes: ['id'],
                required: false
            }]
        }).then((stories: Array<any>) => {
            if (stories.length) {
                let Stories: Array<any> = [];
                stories.forEach((story: any) => {
                    if (story.publishedAt) {
                        story.views = story.users.length;
                    }
                    Stories.push(story.get({
                        plain: true
                    }));
                });
                return reply({
                    "data": Stories
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

    // public addCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
    //     this.database.story.getStory(request.params.idOrSlug).then((story) => {
    //         if (story) {
    //             story.newCard(request.payload, this.database.card).then((res) => {
    //                 return reply({
    //                     "success": true
    //                 });
    //             }).catch((err) => {
    //                 return reply(Boom.badRequest('Can not add this card to the story'));
    //             });

    //         } else {
    //             return reply(Boom.notFound("Story with give id or slug doesn't exist"));
    //         }
    //     });
    // }

    public newStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.createNewStory(request.payload, this.database.card).then((res) => {
            return reply({
                "success": true
            }).code(201);
        }).catch((err) => {
            console.log(err);
            return reply(Boom.badRequest('Problem with payload'));
        });

    }

    public updateStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "updated": true
        });
    }

    public pushLive(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope').then((story: any) => {
            if (story) {
                story.pushLive().then((story: any) => {
                    return reply({
                        "pushed": true
                    });
                });
            } else {
                return reply(Boom.notFound("Story with give id or slug doesn't exist"));
            }
        });
    }
    public preview(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "success": true
        });
    }

    public deleteStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope').then((story: any) => {
            if (story) {
                story.deleteStoryAndCards().then((story: any) => {
                    return reply({
                        "deleted": true
                    });
                });
            } else {
                return reply(Boom.notFound("Story with give id or slug doesn't exist"));
            }
        });
    }
}
