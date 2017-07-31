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
            }
        }, {
            defaultScope: {
                where: {
                    deleted: false
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


    Story.prototype.markRead = function (database, userId) {
        return database.user.findOne({
            where: {
                id: userId
            }
        }).then((user) => {
            user.getStories().then((story) => {
                if (story) {
                    throw 'User has already read the story';
                } else {
                    return this.setUsers(user);
                }
            });
        });
    };

    // Code.prototype.updateCode = function () {
    //     return this.update({
    //         expiresAt: moment().add(12, 'h').toDate()
    //     });
    // };

    // Code.prototype.checkUniqueCode = function (code) {
    //     if (this.code === code && moment().isBefore(this.expiresAt)) {
    //         return true;
    //     } else {
    //         return false;
    //     }
    // };

    // Code.prototype.markCodeInvalid = function () {
    //     return this.update({
    //         expiresAt: null
    //     });
    // };

    return Story;
}