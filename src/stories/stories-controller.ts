import * as Hapi from "hapi";
import * as Boom from "boom";
import { IDb } from "../config";
import { IServerConfigurations } from "../config";

export default class StoryController {

    private configs: IServerConfigurations;
    private database: IDb;

    constructor(configs: IServerConfigurations, database: IDb) {
        this.database = database;
        this.configs = configs;
    }
    public getLatest(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findById(request.auth.credentials.userId).then((user: any) => {
            if (user) {
                this.database.story.getLatestStories(user).then((stories: Array<any>) => {
                    let cardPromises: Array<Promise<any>> = [];
                    stories.forEach(story => {
                        cardPromises.push(story.getPlainCards());
                    });
                    Promise.all(cardPromises).then(() => {
                        this.database.story.getPlainStories(stories).then((plainStories: Array<any>) => {
                            if (plainStories.length <= 2) {
                                return reply({
                                    "latest": plainStories
                                });
                            }
                        });
                    });
                }).catch((err) => {
                    // console.log(err);
                    return reply(Boom.internal('Some server problem'));
                });
            } else {
                return reply(Boom.notFound('User not found'));
            }
        });
    }

    public getArchived(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findById(request.auth.credentials.userId).then((user: any) => {
            if (user) {
                this.database.story.getArchivedStories(user).then((stories: Array<any>) => {
                    let cardPromises: Array<Promise<any>> = [];
                    stories.forEach(story => {
                        cardPromises.push(story.getPlainCards());
                    });
                    Promise.all(cardPromises).then(() => {
                        this.database.story.getPlainStories(stories).then((plainStories: Array<any>) => {
                            return reply({
                                "archived": plainStories
                            });
                        });
                    });
                }).catch((err) => {
                    console.log(err);
                    return reply(Boom.internal('Some server problem'));
                });
            } else {
                return reply(Boom.notFound('User not found.'));
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