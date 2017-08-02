import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';
import * as slug from 'slug';

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
            deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            publishedAt: {
                type: Sequelize.DATE,
                allowNull: true,
                validate: {
                    notEmpty: true
                }
            },
            views: Sequelize.VIRTUAL
        }, {
            defaultScope: {
                where: {
                    deleted: false
                }
            },
            scopes: {
                notPublished: {
                    where: {
                        deleted: false,
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
            as: 'Cards',
            scope: {
                deleted: false
            }
        });
        models.story.belongsToMany(models.user, {
            through: 'readStories',
            scope: {
                status: 'active'
            }
        });
    };

    Story.checkId = function (idOrSlug: any): boolean {
        if (+idOrSlug) {
            return true;
        } else {
            return false;
        }
    };

    Story.getStoryById = function (id: number, scope: string): Promise<any> {
        return this.scope(scope).findOne({
            where: {
                id: id
            },
            attributes: ['id', 'title', 'by', 'slug', 'publishedAt', 'createdAt']
        });
    };

    Story.getStoryBySlug = function (slug: string, scope: string): Promise<any> {
        return Story.scope(scope).find({
            where: {
                slug: slug
            },
            attributes: ['id', 'title', 'by', 'slug', 'publishedAt', 'createdAt']
        });
    };

    Story.getStory = function (idOrSlug: any, scope: string): Promise<any> {
        let story: Promise<any>;
        if (Story.checkId(idOrSlug)) {
            story = this.getStoryById(idOrSlug, scope);
        } else {
            story = this.getStoryBySlug(idOrSlug, scope);
        }
        return story;
    };

    Story.addStoryId = function (cards: Array<any>, storyId: number) {
        cards.forEach(card => {
            card.storyId = storyId;
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
                    this.addStoryId(story.cards, newStory.id);
                    return cardModel.bulkCreate(story.cards, { transaction: t });
                } else {
                    return Promise.resolve();
                }
            });
        });
    };

    // Helper function that checks if a slug already exists in the database.
    // Returns true if slug not present in the database.
    let validateSlug = function (slug: string): Promise<Boolean> {
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

    // Helper function that checks whether a slug is valid or not.
    // It recursively checks and generates a valid slug and returns a promise.
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

    // returns a promise with the validSlug.
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
            return user.getStories({
                where: {
                    id: this.id
                }
            }).then((stories: Array<any>) => {
                if (stories.length) {
                    throw 'User has already read the story';
                } else {
                    return this.addUsers(user);
                }
            });
        });
    };

    Story.prototype.deleteStoryAndCards = function (): Promise<any> {
        return this.getCards().then((cards: Array<any>) => {
            let promises: Array<Promise<any>> = [];
            if (cards.length) {
                cards.forEach(card => {
                    card.deleted = true;
                    promises.push(card.save());
                });
            }
            return Promise.all(promises).then((res: any) => {
                this.deleted = true;
                return this.save();
            });
        });
    };

    Story.prototype.pushLive = function (): Promise<any> {
        this.publishedAt = moment().toDate();
        return this.save();
    };
    return Story;
}