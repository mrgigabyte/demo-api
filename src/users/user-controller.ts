import * as Hapi from "hapi";
import * as Boom from "boom";
import { IServerConfigurations } from "../config";
import { IDb } from "../config";
export default class UserController {

    private configs: IServerConfigurations;
    private database: IDb;
    private dummyData: any;

    constructor(configs: IServerConfigurations, database: IDb) {
        this.database = database;
        this.configs = configs;
    }

    public signup(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.create(request.payload).then((user: any) => {
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
        }).then((user: any) => {
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
        }).then((user: any) => {
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
        }).then((user: any) => {
            if (user) {
                user.requestResetPassword(this.database.resetCode).then(() => {
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
        }).then((user: any) => {
            if (user) {
                user.resetPassword(this.database.resetCode, request.payload.code, request.payload.password).then(() => {
                    return reply({
                        reset: true
                    });
                }).catch((err) => {
                    return reply(Boom.badRequest(err));
                });
            } else {
                return reply(Boom.notFound('Email not registered on platform'));
            }
        });
    }

    public getUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn']],
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user: any) => {
            if (user) {
                return reply({
                    "user": user.get({ plain: true })
                });
            } else {
                reply(Boom.notFound('User not found'));
            }
        }).catch((err) => {
            return reply(Boom.expectationFailed('Expected this to work'));
        });
    }

    public deleteProfile(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user: any) => {
            if (user) {
                user.deleteUser().then(() => {
                    return reply({
                        "deleted": true
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
        }).then((user: any) => {
            if (user) {
                user.updateUserInfo(request.payload).then(() => {
                    return reply({
                        "changed": true
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
        }).then((user: any) => {
            if (user) {
                user.updateUserInfo(request.payload).then(() => {
                    return reply({
                        "changed": true
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
        }).then((user: any) => {
            if (user) {
                console.log(request.payload);
                user.updateUserInfo(request.payload).then((res) => {
                    return reply({
                        "updated": true
                    });
                }).catch((err) => {
                    return reply(Boom.badRequest("Can't update user details"));
                });
            } else {
                return reply(Boom.notFound('User not found'));
            }
        }).catch((err) => {
            console.log(err);
            reply(Boom.expectationFailed('Expected this to work'));
        });
    }

    public getAllUsers(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.getAllUsers().then((users) => {
            return reply({
                "data": users
            });
        }).catch((err) => reply(Boom.notFound(err)));
    }

    public generateCsvLink(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let jwttoken = this.database.user.generateJwtCsv(this.configs);
        return reply({
            "link": request.server.info.uri + `/user/downloadCsv?jwt=` + jwttoken
        });
    }

    public downloadCsv(request: Hapi.Request, reply: Hapi.Base_Reply) {
        if (this.database.user.verifyJwtCsv(request.query.jwt, this.configs.jwtCsvSecret)) {
            this.database.user.getCsv().then((res) => {
                return reply(res).header('Content-Type', 'text/csv')
                    .header('content-disposition', 'attachment; filename=users.csv;');
            }).catch((err) => reply(Boom.notFound(err)));
        } else {
            return reply(Boom.badRequest('Cannot verify JWT'));
        }
    }

    public createJesus(request: Hapi.Request, reply: Hapi.Base_Reply) {
        request.payload.role = 'jesus';
        this.database.user.create(request.payload).then((user: any) => {
            return reply({
                "success": true
            });
        }).catch((err) => {
            this.database.user.findOne({
                where: {
                    email: request.payload.email
                }
            }).then((user: any) => {
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