import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as moment from 'moment';
import * as json2csv from "json2csv";

export default function (sequelize, DataTypes) {
    let User = sequelize.define('user',
        {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            email: {
                type: Sequelize.STRING(50),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isEmail: true
                },
                unique: true
            },
            role: {
                type: Sequelize.ENUM('god', 'jesus', 'romans'),
                allowNull: false,
                validate: {
                    notEmpty: true,
                },
                defaultValue: 'romans'
            },
            password: {
                type: Sequelize.STRING(70),
                allowNull: false,
                validate: {
                    notEmpty: true
                }
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'deleted'),
                allowNull: false,
                defaultValue: 'active',
                validate: {
                    notEmpty: true
                }
            },
            emailNotif: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            pushNotif: {
                type: Sequelize.ENUM('disable', 'morning', 'night', 'day'),
                allowNull: false,
                defaultValue: 'disable'
            },
            deleteOn: {
                type: Sequelize.DATE,
                allowNull: true
            }
        }, {
            defaultScope: {
                where: {
                    status: {
                        $notIn: ['deleted']
                    }
                }
            },
            hooks: {
                beforeCreate: (user, options) => {
                    user.password = bcrypt.hashSync(user.password, 8);
                }
            }
        });

    User.associate = function (models) {
        models.user.belongsToMany(models.story, {
            through: 'readStories',
            scope: {
                deleted: false
            }
        });
        models.user.belongsToMany(models.card, { through: 'favouriteCards' });
    };

    User.hashPassword = function (password): String {
        return bcrypt.hashSync(password, 8);
    };

    User.getAllUsers = function (): Promise<{}> {
        return User.scope(null).findAll({
            attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn'], 'status']
        }).then((users: Array<any>) => {
            if (users.length) {
                let data: Array<any> = [];
                users.forEach((user) => {
                    data.push(user.get({ plain: true }));
                    console.log(user);
                });
                console.log(data);
                return data;
            } else {
                throw 'Users Not found';
            }
        });
    };

    User.hashPassword = function (password): String {
        return bcrypt.hashSync(password, 8);
    };

    User.generateJwtCsv = function (config): String {
        let data: Object = { data: 'CSV' };
        return Jwt.sign(data, config.jwtCsvSecret, { expiresIn: config.jwtCsvExpiration });
    };

    User.verifyJwtCsv = function (jwt, secret): Boolean {
        try {
            Jwt.verify(jwt, secret);
            return true;
        } catch (err) {
            return false;
        }
    };

    User.getCsv = function (): Promise<any> {
        return this.getAllUsers().then((users) => {
            let fields = ['id', 'name', 'email', 'emailNotif', 'pushNotif'];
            let res = json2csv({ data: users, fields: fields });
            return res;
        });
    };

    User.prototype.checkPassword = function (password): Boolean {
        return bcrypt.compareSync(password, this.password);
    };

    User.prototype.generateJwt = function (config): String {
        let role: string = this.role.toUpperCase();
        let jwtData: Object = {
            role: role,
            id: this.id
        };
        return Jwt.sign(jwtData, config.jwtSecret, { expiresIn: config.jwtExpiration });
    };

    User.prototype.sendEmail = function (code): void {
        console.log(code);
    };

    User.prototype.checkUniqueCode = function (code): Boolean {
        if (this.resetPasswordCode === code && moment().isBefore(this.resetCodeExpiresOn)) {
            return true;
        } else {
            return false;
        }
    };

    User.prototype.updatePassword = function (password): Promise<{}> {
        let pswd = User.hashPassword(password);
        return this.update({
            password: pswd,
        });
    };

    User.prototype.deleteUser = function (): Promise<{}> {
        return this.update({
            status: 'deleted',
            deleteOn: moment().toDate()
        });
    };

    User.prototype.updateUserInfo = function (info): Promise<{}> {
        if (info.password) {
            info.password = User.hashPassword(info.password);
        }
        return this.update(info);
    };

    User.prototype.promoteJesus = function (info): Promise<{}> {
        return this.update({
            name: info.name,
            email: info.email,
            password: User.hashPassword(info.password),
            role: info.role
        });
    };

    return User;
}
