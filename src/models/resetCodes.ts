import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';

export default function (sequelize, DataTypes) {
    let Code = sequelize.define('resetCode',
        {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(10),
                allowNull: true,
                validate: {
                    notEmpty: true
                }
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: true,
                validate: {
                    notEmpty: true
                }
            },
            userId: {
                type: Sequelize.INTEGER(11),
                unique: true
            }
        }, {
            hooks: {
                beforeCreate: (code, options) => {
                    code.code = shortid.generate();
                },
                beforeUpdate: (code, options) => {
                    code.code = shortid.generate();
                }
            }
        });

    Code.associate = function (models) {
        models.resetCode.belongsTo(models.user);
    };

    /**
     * Creates a unique code that will be used by the user to reset his/her password.
     * This code will expire in 12 h from the date-time of creation of the code.
     */
    Code.createCode = function (userId) {
        console.log('gege');
        return Code.create({
            expiresAt: moment().add(12, 'h').toDate(),
            userId: userId
        });
    };

    Code.prototype.updateCode = function () {
        return this.update({
            expiresAt: moment().add(12, 'h').toDate()
        });
    };

    /**
     * This function checks whether the unique Code is equal to the code sent in the payload.
     * and checks whether the current time is before the expiry time of the code. 
     */
    Code.prototype.checkUniqueCode = function (code) {
        if (this.code === code && moment().isBefore(this.expiresAt)) {
            return true;
        } else {
            return false;
        }
    };

    /**
     * Makes a code invalid by setting the expiredAt key as null for that user.
     */
    Code.prototype.markCodeInvalid = function () {
        return this.update({
            expiresAt: null
        });
    };

    return Code;
}