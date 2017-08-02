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
                    deleted: false,
                    publishedAt: {
                        $ne: null
                    }
                }
            },
            hooks: {
                beforeCreate: (story, options) => {
                    return story.getSlug().then((slug) => {
                        story.slug = slug;
                    });
                    // code.code = shortid.generate();
                },
                beforeUpdate: (story, options) => {
                    return story.getSlug().then((slug) => {
                        story.slug = slug;
                    });
                    // code.code = shortid.generate();
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
            console.log('hasa');
            return false;
        }
    };

    Story.getStoryById = function (id: number): Promise<any> {
        return this.findOne({
            where: {
                id: id
            }
        });
    };

    Story.getStoryBySlug = function (slug: string): Promise<any> {
        return Story.findOne({
            where: {
                slug: slug
            }
        });
    };

    Story.getStory = function (idOrSlug: any): Promise<any> {
        let story: Promise<any>;
        if (Story.checkId(idOrSlug)) {
            story = this.getStoryById(idOrSlug);
        } else {
            story = this.getStoryBySlug(idOrSlug);
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
                slug: slug,
                deleted: false
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
        return validateSlug(oldSlug).then((valid) => {
            if (!valid) {
                newSlug = oldSlug + '-' + i;
                i++;
                return getValidSlug(newSlug, oldSlug, i);
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
            return user.getStories({ where: { id: this.id } }).then((stories: Array<any>) => {
                if (stories.length) {
                    throw 'User has already read the story';
                } else {
                    return this.addUsers(user);
                }
            });
        });
    };

    return Story;
}