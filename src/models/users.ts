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
            deletedOn: {
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

    User.associate = function (models): void {
        models.user.belongsToMany(models.story, {
            through: 'readStories'
        });
        models.user.belongsToMany(models.card, { through: 'favouriteCards' });
    };

    User.hashPassword = function (password: string): string {
        return bcrypt.hashSync(password, 8);
    };

    User.getAllUsers = function (): Promise<any> {
        return User.scope(null).findAll({
            attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn'], 'status']
        }).then((users: Array<any>) => {
            if (users.length) {
                let data: Array<any> = [];
                users.forEach((user) => {
                    data.push(user.get({ plain: true }));
                });
                return data;
            } else {
                throw 'Users Not found';
            }
        });
    };

    User.prototype.getFavouriteCards = function (cardModel: any): Promise<any> {

        return this.getCards({ attributes: ['id', 'storyId', 'mediaUri', 'mediaType', 'externalLink'] })
            .then((cards: Array<any>) => {
                if (cards.length) {
                    let plainCards: Array<any> = [];
                    cards.forEach((card: any, index: number) => {
                        plainCards.push(card.get({ plain: true }));
                        delete plainCards[index]['favouriteCards'];
                    });
                    return Promise.resolve(plainCards);
                } else {
                    throw 'No favourite cards';
                }
            });
    };

    User.generateJwtCsv = function (config: any): string {
        let data: any = { data: 'CSV' };
        return Jwt.sign(data, config.jwtCsvSecret, { expiresIn: config.jwtCsvExpiration });
    };

    User.verifyJwtCsv = function (jwt: string, secret: string): boolean {
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

    User.prototype.checkPassword = function (password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    };

    User.prototype.generateJwt = function (config: any): string {
        let role: string = this.role.toUpperCase();
        let jwtData: any = {
            role: role,
            id: this.id
        };
        return Jwt.sign(jwtData, config.jwtSecret, { expiresIn: config.jwtExpiration });
    };

    User.prototype.requestResetPassword = function (resetCodeModel: any): Promise<any> {
        return resetCodeModel.findOne({
            where: {
                userId: this.id
            }
        }).then((code: any) => {
            if (code) {
                return code.updateCode();
            } else {
                return resetCodeModel.createCode(this.id);
            }
        }).then((code: any) => {
            return this.sendEmail(code.code);
        });
    };

    User.prototype.sendEmail = function (code: string): void {
        console.log(code);
    };

    User.prototype.resetPassword = function (resetCodeModel: any, resetCode: string, newPassword: string) {
        return resetCodeModel.findOne({
            where: {
                userId: this.id
            }
        }).then((code: any) => {
            if (code) {
                if (code.checkUniqueCode(resetCode)) {
                    return this.updatePassword(newPassword).then(() => {
                        return code.markCodeInvalid();
                    });
                } else {
                    throw 'Unique code no longer valid';
                }
            } else {
                throw 'User has not requested to reset his password';
            }
        });
    };

    User.prototype.checkUniqueCode = function (code: string): boolean {
        if (this.resetPasswordCode === code && moment().isBefore(this.resetCodeExpiresOn)) {
            return true;
        } else {
            return false;
        }
    };

    User.prototype.updatePassword = function (password: string): Promise<any> {
        let pswd = User.hashPassword(password);
        return this.update({
            password: pswd
        });
    };

    User.prototype.deleteUser = function (): Promise<any> {
        return this.update({
            status: 'deleted',
            deletedOn: moment().toDate()
        });
    };

    User.prototype.updateUserInfo = function (info: any): Promise<any> {
        if (info.password) {
            info.password = User.hashPassword(info.password);
            console.log(info);
        }
        return this.update(info);
    };

    User.prototype.getReadStoryIds = function (): Promise<Array<number>> {
        return this.getStories().then((readStories: Array<any>) => {
            let ids: Array<number> = [];
            readStories.forEach(story => {
                ids.push(story.id);
            });
            return ids;
        });
    };

    User.prototype.promoteJesus = function (info: any): Promise<any> {
        return this.update({
            name: info.name,
            email: info.email,
            password: User.hashPassword(info.password),
            role: info.role
        });
    };

    return User;
}
