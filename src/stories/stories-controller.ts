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
                return this.database.story.getLatestStories(user);
            } else {
                throw (Boom.notFound('User not found'));
            }
        }).then((stories: Array<any>) => {
            return this.database.story.getPlainStories(stories);
        }).then((plainStories: Array<any>) => {
            if (plainStories.length <= 2) {
                return reply({
                    "latest": plainStories
                });
            }
        }).catch((err) => reply(err));
    }

    public getArchived(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findById(request.auth.credentials.userId).then((user: any) => {
            if (user) {
                return this.database.story.getArchivedStories(user);
            } else {
                throw (Boom.notFound('User not found.'));
            }
        }).then((stories: Array<any>) => {
            return this.database.story.getPlainStories(stories);
        }).then((plainStories: Array<any>) => {
            return reply({
                "archived": plainStories
            });
        }).catch((err) => reply(err));
    }

    private getStory(idOrSlug: any) {
        return this.database.story.getStory(idOrSlug, 'defaultScope').then((story: any) => {
            if (story) {
                return story.getUsers().then((users: Array<any>) => {
                    story.views = users.length;
                    return story.getPlainCards().then(() => {
                        return Promise.resolve(story.get({ plain: true }));
                    });
                });
            } else {
                throw Boom.notFound("Story with give id or slug doesn't exist");
            }
        });
    }

    public getStoryByIdOrSlug(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.getStory(request.params.idOrSlug).then((story: any) => {
            return reply({ "story": story });
        }).catch((err) => reply(err));
    }

    public markRead(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'published').then((story: any) => {
            if (story) {
                return story.markRead(this.database.user, request.auth.credentials.userId);
            } else {
                throw Boom.notFound("Story with give id or slug doesn't exist");
            }
        }).then((res: any) => {
            return reply({
                "read": true
            }).code(201);
        }).catch((err) => reply(err));
    }

    public getAllPaginatedStories(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getAllPaginatedStories(
            this.database.user, request.query.size, request.query.page, request.query.type, this.configs.baseUrl
        )
            .then((response: any) => {
                return reply(response);
            }).catch((err) => reply(err));
    }

    public newStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.createNewStory(request.payload, this.database.card).then((storyId: number) => {
            this.getStory(storyId).then((story: any) => reply({ "story": story }).code(201));
        }).catch((err) => {
            if (err.name === 'SequelizeValidationError') {
                return reply(Boom.badRequest('Payload data is not valid.'));
            } else {
                return reply(err);
            }
        });
    }

    public updateStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope')
            .then((story: any) => {
                if (story) {
                    return story.updateStory(request.payload, this.database.card).then((res: any) => {
                        return story.save();
                    });
                } else {
                    throw (Boom.notFound("Story with give id or slug doesn't exist"));
                }
            }).then((story: any) => {
                this.getStory(story.id).then((story: any) => reply({ "story": story })).catch((err) => reply(err));
            });
    }

    public pushLive(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope').then((story: any) => {
            if (story) {
                return story.pushLive();
            } else {
                throw (Boom.notFound("Story with give id or slug doesn't exist"));
            }
        }).then((story: any) => {
            return reply({
                "pushed": true
            });
        }).catch((err) => reply(err));
    }

    public deleteStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.story.getStory(request.params.idOrSlug, 'defaultScope').then((story: any) => {
            if (story) {
                return story.destroy();
            } else {
                throw (Boom.notFound("Story with give id or slug doesn't exist"));
            }
        }).then(() => {
            return reply({
                "deleted": true
            });
        }).catch((err) => reply(err));
    }

    public preview(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "success": true
        });
    }
}