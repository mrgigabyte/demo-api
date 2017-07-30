import * as Hapi from "hapi";
import * as Boom from "boom";
import * as GoogleAuth from "google-auth-library";
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
        this.dummyData = [
            {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }, {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z",
                "status": "active"
            }
        ];
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
                reply(Boom.badRequest('User with the given email already exists'));
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

    // this.database.resetCode.findOne({
    //         include: [{
    //             model: this.database.user,
    //             where: { userId: 37 }
    //         }],

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
                reply(Boom.badRequest('Email not registered on platform'));
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
                reply(Boom.badRequest('Email not registered on platform'));
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
            return reply({
                "user": user.get({ plain: true })
            });
        });
    }

    public deleteProfile(request: Hapi.Request, reply: Hapi.Base_Reply) {

        return reply({
            "deleted": true
        });
    }

    public pushNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "changed": true
        });
    }

    public emailNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "changed": true
        });
    }

    public updateUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "updated": true,
        });
    }

    public profileUpdate(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "user": {
                "id": "2",
                "name": "Johnny Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "true",
                "pushNotif": "morning"
            }
        });
    }

    public getAllUsers(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "data": this.dummyData
        });
    }

    public generateCsvLink(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "link": request.server.info.uri + "/user/downloadCsv?jwt=this-is-not-a-jwt-though"
        });
    }

    public downloadCsv(request: Hapi.Request, reply: Hapi.Base_Reply) {
        console.log(request.query.jwt);
        let fields = ['id', 'name', 'email', 'emailNotif', 'pushNotif'];
        let res = json2csv({ data: this.dummyData, fields: fields });
        // console.log(res);        
        return reply(res)
            .header('Content-Type', 'text/csv')
            .header('content-disposition', 'attachment; filename=users.csv;');
    }

}
