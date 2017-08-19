import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as moment from 'moment';
import * as json2csv from "json2csv";
import * as Boom from 'boom';

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
                    user.password = User.hashPassword(user.password);
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

    /**
     * Returns user details in paginated fashion.
     */
    User.getAllPaginatedUsers = function (size: number, page: number, baseUrl: string): Promise<any> {
        if (size > 0 && page >= 0) {
            return User.scope(null).findAndCountAll({
                attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn'], 'status'],
                limit: size,
                offset: page * size
            }).then((res) => {
                let data: Array<any> = [];
                res.rows.forEach((user) => {
                    data.push(user.get({ plain: true }));
                });
                let totalPages = Math.ceil(res.count / size) - 1;
                if (page < totalPages) {  // for pages other than the last page.
                    return ({
                        noOfPages: totalPages + 1,
                        currentPageNo: page + 1,
                        users: data,
                        next: `${baseUrl}/user?page=${page + 1}&size=${size}`
                    });
                } else if (page >= totalPages) { // for last page and any page number that doesn't exist.
                    return ({
                        noOfPages: totalPages + 1,
                        currentPageNo: page + 1,
                        users: data,
                        next: null,                        
                    });
                }
            });
        } else {
            return Promise.reject(Boom.badRequest('Page size and page number must be greater than 0'));
        }
    };

    /**
     * Gets all the favourite cards of a user. 
     * Convert the cards into JSON and then removes the favouriteCards key.
     */
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
                    throw Boom.notFound("User doesn't have any favourite cards");
                }
            });
    };

    /**
     * Generates a JWT that will be used to check the validity of the download CSV link.
     */
    User.generateJwtCsv = function (config: any): string {
        let data: any = { data: 'CSV' };
        return Jwt.sign(data, config.jwtCsvSecret, { expiresIn: config.jwtCsvExpiration });
    };

    /**
     * Returns a boolean after verifying the jwt sent in the query param of downloadCsv link.
     */
    User.verifyJwtCsv = function (jwt: string, secret: string): boolean {
        try {
            Jwt.verify(jwt, secret);
            return true;
        } catch (err) {
            return false;
        }
    };

    /**
     * Returns user information in csv format.
     */
    User.getCsv = function (): Promise<any> {
        let fields: Array<string> = ['id', 'name', 'email', 'emailNotif', 'pushNotif', 'createdAt', 'status'];
        return this.scope(null).findAll({
            attributes: fields
        }).then((users: Array<any>) => {
            if (users.length) {
                let data: Array<any> = [];
                users.forEach((user) => {
                    data.push(user.get({ plain: true }));
                });
                return Promise.resolve(data);
            } else {
                throw Boom.notFound('Users Not found');
            }
        }).then((users: Array<any>) => {
            let csv = json2csv({ data: users, fields: fields });
            return csv;
        });
    };

    User.prototype.checkPassword = function (password: string): boolean {
        return bcrypt.compareSync(password, this.password);
    };

    /**
     * Generates JWT(API_KEY) which will be used for authenticating a user.
     */
    User.prototype.generateJwt = function (config: any): string {
        let role: string = this.role.toUpperCase();
        let jwtData: any = {
            role: role,
            id: this.id
        };
        return Jwt.sign(jwtData, config.jwtSecret, { expiresIn: config.jwtExpiration });
    };

    /**
     * Generates a unique code that will be used by the user for resetting his/her password.
     */
    User.prototype.generatePasswordResetCode = function (resetCodeModel: any): Promise<string> {
        return resetCodeModel.findOne({
            where: {
                userId: this.id
            }
        }).then((code: any) => {
            if (code) {
                return code.updateCode(); // replaces the old code with a new code in the database. 
            } else {
                return resetCodeModel.createCode(this.id); // creates the code for the first time.
            }
        }).then((code: any) => {
            return (code.code);
        });
    };

    /**
     * Updates the password to the one sent in the payload after verifying the unique code.
     */
    User.prototype.resetPassword = function (resetCodeModel: any, resetCode: string, newPassword: string) {
        return resetCodeModel.findOne({
            where: {
                userId: this.id
            }
        }).then((code: any) => {
            if (code) {
                if (code.checkUniqueCode(resetCode)) { // checks whether the code sent in the payload is same as that in the database. 
                    return this.updatePassword(newPassword).then(() => {
                        return code.markCodeInvalid(); // marks the code as invalid so that it cant be reused.
                    });
                } else {
                    throw Boom.badRequest('Link to reset the password is no longer valid.');
                }
            } else {
                throw Boom.badRequest('User has not requested to reset his password');
            }
        });
    };

    User.prototype.updatePassword = function (password: string): Promise<any> {
        let pswd = User.hashPassword(password);
        return this.update({
            password: pswd
        });
    };

    /**
     * Soft deletes a user by only changing the status from active --> deleted.
     */
    User.prototype.softDeleteUser = function (): Promise<any> {
        return this.update({
            status: 'deleted',
            deletedOn: moment().toDate()
        });
    };

    /**
     * Updates user info with the info sent in the payload.
     * If password is present in the payload, first hash it and then update the users info.
     */
    User.prototype.updateUserInfo = function (info: any): Promise<any> {
        if (info.password) {
            info.password = User.hashPassword(info.password);
        }
        return this.update(info);
    };

    /**
     * Returns an array of all the ids read by a user.
     */
    User.prototype.getReadStoryIds = function (): Promise<Array<number>> {
        return this.getStories().then((readStories: Array<any>) => {
            let ids: Array<number> = [];
            readStories.forEach(story => {
                ids.push(story.id);
            });
            return ids;
        });
    };

    return User;
}
