import * as Hapi from "hapi";
import * as Boom from "boom";
import * as GoogleAuth from "google-auth-library";
import * as Jwt from "jsonwebtoken";
import * as json2csv from "json2csv";
import { IServerConfigurations } from "../config";
import { IDb } from "../config";
import { UserModel, UserInstance } from '../models/users';
export default class UserController {

    private configs: IServerConfigurations;
    private database: IDb;
    private dummyData: any;

    constructor(configs: IServerConfigurations, database: IDb) {
        this.database = database;
        this.configs = configs;
    }

    public signup(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.create(request.payload).then((user) => {
            return reply({
                "success": true
            });
        }).catch((err) => {
            reply(Boom.conflict('User with the given details already exists'));
        });
    }

    public checkEmail(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            }
        }).then((user) => {
            if (!user) {
                return reply({
                    "valid": true

                });
            } else {
                reply(Boom.conflict('User with the given email already exists'));
            }
        });
    }

    public login(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            }
        }).then((user) => {
            if (user) {
                if (user.checkPassword(request.payload.password)) {
                    return reply({
                        "jwt": user.generateJwt(this.configs)
                    });
                } else {
                    reply(Boom.unauthorized('Password is incorrect.'));
                }

            } else {
                reply(Boom.unauthorized('Email or Password is incorrect.'));
            }
        });
    }

    public requestResetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            }
        }).then((user) => {
            if (user) {
                this.database.resetCode.findOne({
                    where: {
                        userId: user.id
                    }
                }).then((code) => {
                    if (code) {
                        return code.updateCode();
                    } else {
                        return this.database.resetCode.createCode(user.id);
                    }
                }).then((code) => {
                    user.sendEmail(code.code);
                    return reply({
                        "success": true
                    });
                });
            } else {
                reply(Boom.notFound('Email not registered on platform'));
            }
        });

    }

    public resetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            }
        }).then((user) => {
            if (user) {
                this.database.resetCode.findOne({
                    where: {
                        userId: user.id
                    }
                }).then((code) => {
                    if (code) {
                        if (code.checkUniqueCode(request.payload.code)) {
                            user.updatePassword(request.payload.password).then(() => {
                                code.markCodeInvalid().then(() => {
                                    return reply({
                                        reset: true
                                    });
                                });
                            }).catch((reason) => {
                                reply(Boom.badImplementation(reason));
                            });
                        } else {
                            reply(Boom.badRequest('Unique code no longer valid'));
                        }
                    } else {
                        reply(Boom.badRequest('User has not requested to reset his password'));
                    }
                });
            } else {
                reply(Boom.notFound('Email not registered on platform'));
            }
        });
    }

    public getUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn']],
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user) => {
            if (user) {
                return reply({
                    "user": user.get({ plain: true })
                });
            } else {
                reply(Boom.notFound('User not found'));
            }
        }).catch((err) => {
            reply(Boom.expectationFailed('Expected this to work'));

        });
    }

    public deleteProfile(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user) => {
            if (user) {
                user.deleteUser()
                    .then(() => {
                        return reply({
                            deleted: true
                        });
                    });

            } else {

                return reply(Boom.notFound('User not found'));
            }
        });
    }

    public pushNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user) => {
            if (user) {
                user.pushNotification(request.payload.pushNotif)
                    .then(() => {
                        return reply({
                            changed: true
                        });
                    });

            } else {

                return reply(Boom.notFound('User not found'));
            }
        });
    }

    public emailNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user) => {
            if (user) {
                user.emailNotification(request.payload.emailNotif)
                    .then(() => {
                        return reply({
                            changed: true
                        });
                    });

            } else {

                return reply(Boom.notFound('User not found'));
            }
        });
    }

    public updateUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user) => {
            if (user) {
                user.updateUser(request.payload)
                    .then((res) => {
                        console.log(res);
                        return reply({
                            updated: true
                        });
                    });

            } else {

                return reply(Boom.notFound('User not found'));
            }
        }).catch((err) => {
            reply(Boom.expectationFailed('Expected this to work'));

        });
    }

    public getAllUsers(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.getAllUsersData()
            .then((userdata) => {
                console.log(userdata);
                return reply(
                    {
                        "data": userdata
                    }
                );
            }).catch((err) => {
                console.log(err);
                reply(Boom.notFound('No Data found'));
            });
    }

    public generateCsvLink(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let jwttoken = this.database.user.generateCSVJwt(this.configs);
        return reply({
            "link": request.server.info.uri + `/user/downloadCsv?jwt=` + jwttoken
        });
    }

    public downloadCsv(request: Hapi.Request, reply: Hapi.Base_Reply) {
        try {
            Jwt.verify(request.query.jwt, 'CSV');
        }
        catch (err) {
            return reply(Boom.unauthorized('Invalid Token'));
        }
        this.database.user.getAllUsersData()
            .then((userdata) => {
                let fields = ['id', 'name', 'email', 'emailNotif', 'pushNotif'];
                let res = json2csv({ data: userdata, fields: fields });
                return reply(res)
                    .header('Content-Type', 'text/csv')
                    .header('content-disposition', 'attachment; filename=users.csv;');
            }).catch((err) => {
                reply(Boom.expectationFailed('Expected this to work'));
            });
    }

    public createJesus(request: Hapi.Request, reply: Hapi.Base_Reply) {
        request.payload.role = 'jesus';
        this.database.user.create(request.payload).then((user) => {
            return reply({
                "success": true
            });
        }).catch((err) => {
            this.database.user.findOne({
                where: {
                    email: request.payload.email
                }
            }).then((user) => {
                user.promoteJesus(request.payload)
                    .then(() => {
                        return reply({
                            "success": true
                        });
                    });
            });
        });
    }
}