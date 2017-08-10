import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';
import * as slug from 'slug';
import * as Boom from 'boom';

export default function (sequelize, DataTypes) {
    let Story = sequelize.define('story',
        {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            title: {
                type: Sequelize.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            slug: {
                type: Sequelize.STRING(100),
                allowNull: false,
                unique: true,
                validate: {
                    notEmpty: true
                }
            },
            by: {
                type: Sequelize.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            publishedAt: {
                type: Sequelize.DATE,
                allowNull: true,
                validate: {
                    notEmpty: true
                }
            },
            views: Sequelize.VIRTUAL,
            cards: Sequelize.VIRTUAL
        }, {
            scopes: {
                published: {
                    where: {
                        publishedAt: {
                            $ne: null
                        }
                    }
                }
            },
            hooks: {
                beforeCreate: (story, options) => {
                    return story.getSlug().then((slug) => {
                        story.slug = slug;
                    });
                }
            }
        });

    Story.associate = function (models): void {
        models.story.hasMany(models.card, {
            as: 'Cards'
        });
        models.story.belongsToMany(models.user, {
            through: 'readStories',
            scope: {
                status: 'active'
            }
        });
    };

    /**
     * Helper function that returns true if idOrSlug is number else false.
     */
    let checkId = function (idOrSlug: any): boolean {
        if (+idOrSlug) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * First, it will get the ids of stories which are read by the user.
     * Then, it will find all the stories which are not read by the user and are published.
     * and, will return at max of 2 stories.
     */
    Story.getLatestStories = function (userInstance: any): Promise<any> {
        return userInstance.getReadStoryIds().then((ids: Array<number>) => {
            return this.scope('published').findAll({
                order: [["publishedAt", 'DESC']],
                where: {
                    id: {
                        $notIn: ids
                    },
                    publishedAt: {
                        $gt: userInstance.createdAt
                    }
                },
                limit: 2,
                attributes: ['id', 'title', 'slug', 'by', 'createdAt', 'publishedAt']
            });
        });
    };

    /**
     * It will return all those stories which are read by the user. 
     * And, the stories that are not latest stories.
     */
    Story.getArchivedStories = function (userInstance: any): Promise<Array<any>> {
        return userInstance.getReadStoryIds().then((ids: Array<number>) => {
            return this.scope('published').findAll({
                order: [["publishedAt", 'DESC']],
                where: {
                    id: {
                        $in: ids
                    },
                    publishedAt: {
                        $gt: userInstance.createdAt
                    }
                },
                attributes: ['id', 'title', 'slug', 'by', 'createdAt', 'publishedAt']
            }).then((readStories: Array<any>) => {
                return this.scope('published').findAll({
                    order: [["publishedAt", 'DESC']],
                    where: {
                        id: {
                            $notIn: ids
                        },
                        publishedAt: {
                            $gt: userInstance.createdAt
                        }
                    },
                    attributes: ['id', 'title', 'slug', 'by', 'createdAt', 'publishedAt']
                }).then((notReadStories: Array<any>) => {
                    let archivedStories: Array<any>;
                    if (notReadStories.length > 2) {
                        notReadStories.splice(0, 2);
                        archivedStories = notReadStories.concat(readStories);
                    } else if (notReadStories.length <= 2) {
                        archivedStories = readStories;
                    }
                    return Promise.resolve(archivedStories);
                });
            });
        });
    };


    /**
     * Static funtion that returns plain stories(JSON) with plain(JSON) cards.
     */
    Story.getPlainStories = function (stories: Array<any>): Promise<Array<any>> {
        let Stories: Array<Promise<any>> = [];
        let cardPromises: Array<Promise<any>> = [];
        stories.forEach(story => {
            cardPromises.push(story.getPlainCards());
        });
        return Promise.all(cardPromises).then(() => {
            stories.forEach((story: any) => {
                Stories.push(story.get({
                    plain: true
                }));
            });
            return Promise.resolve(Stories);
        });

    };

    let getStoryById = function (id: number, scope: string): Promise<any> {
        return Story.scope(scope).findOne({
            where: {
                id: id
            },
            attributes: ['id', 'title', 'by', 'slug', 'publishedAt', 'createdAt']
        });
    };

    let getStoryBySlug = function (slug: string, scope: string): Promise<any> {
        return Story.scope(scope).find({
            where: {
                slug: slug
            },
            attributes: ['id', 'title', 'by', 'slug', 'publishedAt', 'createdAt']
        });
    };


    /**
     * Static function that calls getStoryById or getStoryBySlug after checking the type of idOrSlug param.
     */
    Story.getStory = function (idOrSlug: any, scope: string): Promise<any> {
        let storyPromise: Promise<any>;
        if (checkId(idOrSlug)) {
            storyPromise = getStoryById(idOrSlug, scope);
        } else {
            storyPromise = getStoryBySlug(idOrSlug, scope);
        }
        return storyPromise;
    };

    /**
     * Helper function that adds storyId and order to cards object.
     */
    let addStoryIdAndOrder = function (cards: Array<any>, storyId: number) {
        cards.forEach((card, order: number) => {
            card.storyId = storyId;
            card.order = order;
        });
    };

    Story.createNewStory = function (story: any, cardModel: any): Promise<any> {
        return sequelize.transaction((t) => {
            return this.create({
                "title": story.title,
                "by": story.by,
                "slug": story.title
            }, { transaction: t }).then((newStory) => {
                if (story.cards) {
                    addStoryIdAndOrder(story.cards, newStory.id);
                    return cardModel.bulkCreate(story.cards, { transaction: t });
                } else {
                    return Promise.resolve();
                }
            });
        });
    };

    Story.getAllPaginatedStories = function (userModel: any, size: number, page: number): Promise<Array<any>> {
        if (size > 0 && page >= 0) {
            return this.findAndCountAll({
                attributes: ['id', 'title', 'slug', 'by', 'createdAt', 'publishedAt'],
                limit: size,
                offset: page * size
            }).then((res: any) => {
                if (res.rows.length) {
                    let promises: Array<Promise<any>> = [];
                    res.rows.forEach((story: any) => {
                        if (story.publishedAt) {
                            promises.push(story.getUsers().then((users: Array<any>) => {
                                story.views = users.length;
                            }));
                        }
                    });
                    return Promise.all(promises).then(() => {
                        return Story.getPlainStories(res.rows).then((stories: Array<any>) => {
                            if (page < Math.ceil(res.count / size) - 1) {  // for pages other than the last page.
                                return ({
                                    stories: stories,
                                    next: `http://localhost/api/user?page=${page + 1}&size=${size}`
                                });
                            } else if (page === Math.ceil(res.count / size) - 1) { // for last page.
                                return ({
                                    stories: stories
                                });
                            }
                        });
                    });
                } else {
                    return ({
                        stories: res.rows
                    });
                }
            });
        } else {
            return Promise.reject(Boom.badRequest('Page size and page number must be greater than 0'));
        }
    };

    Story.prototype.getPlainCards = function (): Promise<any> {
        return this.getCards({
            order: [['order', 'ASC']],
            attributes: ['id', 'mediaUri', 'mediaType', 'externalLink']
        }).then((cards: Array<any>) => {
            if (cards.length) {
                let plainCards: Array<any> = [];
                cards.forEach(card => {
                    plainCards.push(card.get({ plain: true }));
                });
                this.cards = plainCards;
            }
        });
    };

    /**
     * Helper function that checks if a slug already exists in the database.
     * Returns true if slug not present in the database.
     */
    let validateSlug = function (slug: string): Promise<boolean> {
        return Story.unscoped().findOne({
            where: {
                slug: slug
            }
        }).then((story) => {
            if (!story) {
                return true;
            } else {
                return false;
            }
        });
    };

    /**
     * Helper function that checks whether a slug is valid or not.
     * It recursively checks and generates a valid slug and returns a promise.
     */

    let getValidSlug = function (oldSlug: string, newSlug: string, i: number): Promise<string> {
        return validateSlug(newSlug).then((valid) => {
            if (!valid) {
                newSlug = oldSlug + '-' + i;
                i++;
                return getValidSlug(oldSlug, newSlug, i);
            } else {
                return newSlug;
            }
        });
    };

    /**
     * returns a promise with the validSlug.
     */
    Story.prototype.getSlug = function (): Promise<string> {
        return getValidSlug(slug(this.title), slug(this.title), 1).then((validSlug: string) => {
            return validSlug;
        });
    };

    Story.prototype.markRead = function (userModel: any, userId: number): Promise<any> {
        return userModel.findOne({
            where: {
                id: userId
            }
        }).then((user) => {
            if (user) {
                return user.getStories({ where: { id: this.id } }).then((stories: Array<any>) => {
                    if (stories.length) {
                        throw Boom.conflict('User has already read the story');
                    } else {
                        return this.addUsers(user);
                    }
                });
            } else {
                throw Boom.notFound('User not found');
            }
        });
    };


    Story.prototype.pushLive = function (): Promise<any> {
        this.publishedAt = moment().toDate();
        return this.save();
    };

    /**
     * Helper function that update card details.
     */
    let updateCardAttributes = function (card: any, cardModel: any, storyId: number, t: any): Promise<any> {
        return sequelize.transaction((t) => {
            return cardModel.findOne({
                where: {
                    id: card.id,
                    storyId: storyId
                }
            }).then((oldCard: any) => {
                if (oldCard) {
                    return oldCard.update(card, { transaction: t });
                } else {
                    throw Boom.notFound('Card with ' + card.id + ' not found');
                }
            });
        });
    };

    /**
     * This function deletes all those cards which are no longer assosciated with the story.
     */
    Story.prototype.deleteOldCards = function (t: any, newCards?: Array<any>): Promise<any> {
        // TDOD use where clause to destroy.
        return sequelize.transaction((t) => {
            let promises: Array<Promise<any>> = [];
            return this.getCards().then((oldCards: Array<any>) => {
                oldCards.forEach(oldCard => {
                    if (newCards) {
                        let found = false;
                        newCards.forEach(newCard => {
                            if (newCard.id === oldCard.id) {
                                found = true;
                            }
                        });
                        if (!found) {
                            promises.push(oldCard.destroy({ transaction: t }));
                        }
                    } else {
                        promises.push(oldCard.destroy({ transaction: t }));
                    }
                });
                return Promise.all(promises);
            });
        });
    };

    /**
     * This function updates story details. This functin does the following:
     * 1) Creates new Cards if card is not sent in the payload.
     * 2) Update details of existing cards with the help of card id.
     * 3) Remove those cards which are no longer associated with the story.
     */
    Story.prototype.updateStory = function (story: any, cardModel: any): Promise<any> {
        let updatePromises: Array<any> = [];
        let createPromises: Array<any> = [];
        return sequelize.transaction((t) => {
            this.title = story.title;
            this.by = story.by;
            return this.getSlug().then((slug) => {
                this.slug = slug;
                if (story.cards) {
                    return this.deleteOldCards(t, story.cards).then(() => {
                        addStoryIdAndOrder(story.cards, this.id);
                        story.cards.forEach(card => {
                            if (!card.id) {
                                createPromises.push(cardModel.create(card, { transaction: t }));
                            } else {
                                updatePromises.push(updateCardAttributes(card, cardModel, this.id, t));
                            }
                        });
                        return Promise.all(updatePromises).then(() => {
                            return Promise.all(createPromises);
                        });
                    });
                } else {
                    return this.deleteOldCards();
                }
            });
        });
    };
    return Story;
}