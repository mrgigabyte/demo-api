import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';

export default function (sequelize, DataTypes) {
    let Card = sequelize.define('card',
        {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            order: {
                type: Sequelize.INTEGER(5),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            mediaUri: {
                type: Sequelize.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isUrl: true
                }
            },
            mediaType: {
                type: Sequelize.ENUM('image', 'video'),
                allowNull: false,
            },
            deleted: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            externalLink: {
                type: Sequelize.STRING(100),
                allowNull: true,
                validate: {
                    isUrl: true
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
    Card.assosciate = function (models) {
        models.card.belongsToMany(models.user, {
            through: 'favouriteCards',
            scope: {
                status: 'active'
            }
        });
    };


    // Code.createCode = function (userId) {
    //     return Code.create({
    //         expiresAt: moment().add(12, 'h').toDate(),
    //         userId: userId
    //     });
    // };

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

    return Card;
}