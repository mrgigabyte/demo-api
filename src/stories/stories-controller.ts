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
            "createdOn": "2017-07-22T07:15:13.250Z",
            "publishedOn": "2017-07-25T07:15:13.250Z",
            "read": "false",
            "cardCount": 5,
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
            "createdOn": "2017-07-21T07:15:13.250Z",
            "publishedOn": "2017-07-23T07:15:13.250Z",
            "read": "false",
            "cardCount": 3,
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
            "createdOn": "2017-07-25T07:15:13.250Z",
            "read": "false",
            "cardCount": 2,
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

    private checkId(idOrSlug: any): boolean {
        if (+idOrSlug) {
            return true;
        } else {
            console.log('hasa');
            return false;
        }
    }

    private getStoryById(id: number): Promise<any> {
        return this.database.story.findOne({
            where: {
                id: id
            }
        });
    }

    private getStoryBySlug(slug: string): Promise<any> {
        return this.database.story.findOne({
            where: {
                slug: slug
            }
        });
    }

    private getStory(idOrSlug) {
        let story: Promise<any>;
        if (this.checkId(idOrSlug)) {
            story = this.getStoryById(idOrSlug);
        } else {
            story = this.getStoryBySlug(idOrSlug);
        }
        return story;
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
        console.log(request.params.idOrSlug);
        this.getStory(request.params.idOrSlug)
            .then((story) => {
                console.log(story);
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
        this.getStory(request.params.idOrSlug).then((story) => {
            if (story) {
                story.markRead(this.database, request.auth.credentials.userId).then((res) => {
                    console.log(res);
                    return reply({
                        "read": true
                    });
                }).catch((err) => {
                    console.log(err);
                    reply(Boom.expectationFailed("Can't mark the story as read for the user"));
                });
            } else {
                reply(Boom.notFound("Story with give id or slug doesn't exist"));
            }
        });
    }

    public getArchived(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let tempStory1 = this.dummyStory1;
        tempStory1.read = true;
        let tempStory2 = this.dummyStory2;
        tempStory2.read = true;
        return reply({
            "data": [tempStory1, tempStory2, this.dummyStory1, this.dummyStory2]
        });
    }

    public getAllStories(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let tempStory1 = this.dummyStory1;
        tempStory1.read = true;
        let tempStory2 = this.dummyStory2;
        tempStory2.read = true;
        return reply({
            "data": [tempStory1, tempStory2, this.dummyStory1, this.dummyStory3, this.dummyStory2]
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
