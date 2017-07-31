import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as moment from 'moment';

export interface UserAttribute {
    id?: string;
    name?: string;
    email?: string;
    password?: string;
    status?: string;
    emailNotif?: boolean;
    pushNotif?: string;
    deleteOn?: string;
    resetPasswordCode?: string;
    resetCodeExpiresOn?: string;
}

export interface UserInstance extends Sequelize.Instance<UserAttribute>, UserAttribute {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    email: string;
    password: string;
    callMe(): void;
    hashPassword(password: string): void;
}

export interface UserModel extends Sequelize.Model<UserInstance, UserAttribute> {
}

export default function (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes) {
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
            hooks: {
                beforeCreate: (user: UserInstance, options) => {
                    user.password = bcrypt.hashSync(user.password, 8);
                },
                beforeUpdate: (user: UserInstance, options)=>{
                    user.updatedAt = moment().add(12, 'h').toDate();
                }
            }
        });

    User.prototype.checkPassword = function (password): Boolean {
        return bcrypt.compareSync(password, this.password);
    };

    User.prototype.generateJwt = function (config): String {
        return Jwt.sign({ role: this.role.toUpperCase(), id: this.id }, config.jwtSecret, { expiresIn: config.jwtExpiration });
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
        this.password = password;
        return new Promise((resolve, reject) => {
            this.update({
<<<<<<< HEAD
                password: User.hashPassword(password),
                resetPasswordCode: null,
                resetCodeExpiresOn: null
=======
                password: password,
>>>>>>> vidur/master
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject('failed to update password');
            });
        });
    };

<<<<<<< HEAD
    User.prototype.deleteUserData = function (userId): Promise<{}> {
        this.userId = userId;
        return new Promise((resolve, reject) => {
            this.update({
                status: 'deleted',
                deleteOn: moment().add(12, 'h').toDate()
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject('failed to delete the account');
            });
        });
    };

    User.prototype.pushNotification = function(notifType): Promise<{}> {
            this.notifType = notifType;
            return new Promise((resolve,reject)=>{
                this.update({
                pushNotif: notifType
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject('failed to update the push Notification');
                 });
            });
    };

     User.prototype.emailNotification = function(state): Promise<{}> {
            this.state = state;
            return new Promise((resolve,reject)=>{
                this.update({
                emailNotif: state
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject('failed to update the email Notification');
                 });
            });
    };

     User.prototype.updateUser = function(info): Promise<{}> {
            this.info = info;
            return new Promise((resolve,reject)=>{
                this.update({
                name: info.name,
                email:info.email,
                password: User.hashPassword(info.password)
            }).then(() => {
                resolve();
            }).catch((err) => {
                reject('failed to update the user info');
                 });
            });
    };

    User.prototype.getStatus = function(){
        return this.status;
    };

    User.hashPassword = function(password): String {
        return bcrypt.hashSync(password, 8);
    };

    return User;
}