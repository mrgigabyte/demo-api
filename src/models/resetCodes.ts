import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';

export interface ResetCodeAttribute {
    id?: string;
    code?: string;
    userId?: string;
    expiresAt?: string;
}

export interface ResetCodeInstance extends Sequelize.Instance<ResetCodeAttribute>, ResetCodeAttribute {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ResetCodeModel extends Sequelize.Model<ResetCodeInstance, ResetCodeAttribute> {
}

export default function (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes) {
    let Code = sequelize.define('resetCode',
        {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(150),
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

    Code.assosciations = function (models) {
        models.resetCode.belongsTo(models.user);
        // Code.belongsTo(models.user);
    };


    Code.createCode = function (userId) {
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

    Code.prototype.checkUniqueCode = function (code) {
        if (this.code === code && moment().isBefore(this.expiresAt)) {
            return true;
        } else {
            return false;
        }
    };

    Code.prototype.markCodeInvalid = function () {
        return this.update({
            expiresAt: null
        });
    };


    return Code;
}