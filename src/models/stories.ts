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
                beforeCreate: (code, options) => {
                    // code.code = shortid.generate();
                },
                beforeUpdate: (code, options) => {
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

    // Story.prototype.newCard = function (card, cardModel) {
    //     return sequelize.transaction((t) => {
    //         return cardModel.create(card, {transaction: t}).then((card) => {
    //             return this.addCards(card, {transaction: t});
    //         });
    //     });
    // };

    return Story;
}