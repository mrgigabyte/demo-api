import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';

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
                    story.slug = story.getSlug();
                    // code.code = shortid.generate();
                },
                beforeUpdate: (story, options) => {
                    story.slug = story.getSlug();
                    // code.code = shortid.generate();
                }
            }
        });

    Story.assosciate = function (models) {
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
        return this.findOne({
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

    Story.createNewStory = function (story, cardModel): Promise<any> {
        // return sequelize.transaction((t) => {
            return this.create({
                "title": story.title,
                "by": story.by,
                "slug": story.title
            }, 
            // { transaction: t }
            ).then((newStory) => {
                if (story.cards) {
                    return new Promise((resolve, reject) => {
                        cardModel.bulkCreate(story.cards, 
                        // { transaction: t }
                        ).then(() => {
                            console.log('finishes creating cards');
                            cardModel.findAll({
                                where: {
                                    "storyId": null
                                }
                            }).then((newCards) => {
                                console.log('finishes finding cards');
                                console.log(newCards);
                                newStory.addCards(newCards, 
                                // { transaction: t }
                                ).then(() => {
                                    resolve();
                                });
                            });
                        });
                    });
                } else {
                    return Promise.resolve();
                }
            });
        // });
    };

    Story.prototype.markRead = function (database, userId) {
        return database.user.findOne({
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

    Story.prototype.getSlug = function (): String {
        let lowerCaseTitle: String = this.title.toLowerCase();
        return lowerCaseTitle.replace(/\s/g, '-');
    };

    // Story.prototype.newCard = function (card, cardModel) {
    //     return sequelize.transaction((t) => {
    //         return cardModel.create(card, {transaction: t}).then((card) => {
    //             return this.addCards(card, {transaction: t});
    //         });
    //     });
    // };

    return Story;
}