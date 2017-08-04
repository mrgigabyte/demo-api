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
        this.database.user.findById(request.auth.credentials.userId).then((user) => {
            if (user) {
                this.database.story.getLatestStories(user).then((stories: Array<any>) => {
                    let cardPromises: Array<Promise<any>> = [];
                    stories.forEach(story => {
                        cardPromises.push(story.getPlainCards());
                    });
                    Promise.all(cardPromises).then(() => {
                        this.database.story.getPlainStories(stories).then((plainStories) => {
                            if (plainStories.length < 2) {
                                return reply({
                                    "latest": plainStories
                                });
                            } else {
                                console.log('expected this to work');
                                return reply(Boom.internal('Some server problem'));
                            }
                        });
                    });
                }).catch((err) => {
                    console.log(err);
                    return reply(Boom.internal('Some server problem'));
                });
            }
        });
    }

     public getArchived(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findById(request.auth.credentials.userId).then((user) => {
            if (user) {
                this.database.story.getArchivedStories(user).then((stories: Array<any>) => {
                    let cardPromises: Array<Promise<any>> = [];
                    stories.forEach(story => {
                        cardPromises.push(story.getPlainCards());
                    });
                    Promise.all(cardPromises).then(() => {
                        this.database.story.getPlainStories(stories).then((plainStories) => {
                                return reply({
                                    "archived": plainStories
                                });
                        });
                    });
                }).catch((err) => {
                    console.log(err);
                    return reply(Boom.internal('Some server problem'));
                });
            }
        });
    }

    public getStoryByIdOrSlug(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope')
            .then((story: any) => {
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
        this.database.story.getStory(request.params.idOrSlug, 'published').then((story: any) => {
            if (story) {
                story.markRead(this.database.user, request.auth.credentials.userId).then((res: any) => {
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

    public getAllStories(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getAllStories(this.database.user).then((stories: Array<any>) => {
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
        this.database.story.createNewStory(request.payload, this.database.card).then((res: any) => {
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
            .then((story: any) => {
                if (story) {
                    story.updateStory(request.payload, this.database.card).then((res: any) => {
                        story.save().then((res: any) => {
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