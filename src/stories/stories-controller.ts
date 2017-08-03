import * as Hapi from "hapi";
import * as Boom from "boom";
// import * as Jwt from "jsonwebtoken";
// import * as GoogleAuth from "google-auth-library";

import { IServerConfigurations } from "../config";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;
    private dummyStory1: any;
    private dummyStory2: any;
    private dummyStory3: any;

    constructor(configs: IServerConfigurations, database: any) {
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
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "externalLink": "https://wwww.loremipsum.com",
                },
                {
                    "id": 27,
                    "order": 2,
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "externalLink": "https://wwww.loremipsum.com",
                    
                },
                {
                    "id": 31,
                    "order": 3,
                    "mediaType": "video",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "externalLink": "https://wwww.loremipsum.com",
                    
                },
                {
                    "id": 42,
                    "order": 4,
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    
                },
                {
                    "id": 51,
                    "order": 5,
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "externalLink": "https://wwww.loremipsum.com",
                    
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
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "externalLink": "https://wwww.loremipsum.com",
                },
                {
                    "id": 2,
                    "order": 2,
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "externalLink": "https://wwww.loremipsum.com",
                    
                },
                {
                    "id": 3,
                    "order": 3,
                    "mediaType": "video",
                    "mediaUri": "https://wwww.loremipsum.com",
                    
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
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    "link": "https://wwww.loremipsum.com",
                },
                {
                    "id": 22,
                    "order": 2,
                    "mediaType": "image",
                    "mediaUri": "https://wwww.loremipsum.com",
                    
                }
            ]
        };
    }

    public getLatest(request: Hapi.Request, reply: Hapi.Base_Reply) {
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
        this.database.story.getAllStories(this.database.user).then((stories) => {
            if (stories.length) {
                return reply({
                    "data": stories
                });
            }
        }).catch((err) => {
            return reply(Boom.notFound(err));
        });
    }

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
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope')
            .then((story) => {
                if (story) {
                    story.updateStory(request.payload, this.database.card).then((res) => {
                        story.save().then((res) => {
                            return reply({
                                "updated": true
                            });
                        });
                    }).catch((err) => {
                        console.log(err);
                        return reply(Boom.badRequest('Error in payload'));
                    });
                } else {
                    return reply(Boom.notFound("Story with give id or slug doesn't exist"));
                }
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

    public deleteStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope').then((story: any) => {
            if (story) {
                story.destroy().then(() => {
                    return reply({
                        "deleted": true
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
}