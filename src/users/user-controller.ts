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
            if (user) {if(user.getStatus !== 'deleted'){

                if (user.checkPassword(request.payload.password)) {
                    return reply({
                        "jwt": user.generateJwt(this.configs)
                    });
                } else {
                    reply(Boom.unauthorized('Password is incorrect.'));
                }
            }
            else{
                return reply(Boom.notFound('the user profile has been deleted'));
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
                user.generateUniqueCode().then((code) => {
                    user.sendEmail(code);
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
                if (user.checkUniqueCode(request.payload.code)) {
                    user.updatePassword(request.payload.password).then(() => {
                        return reply({
                            reset: true
                        });
                    }).catch((reason) => {
                        reply(Boom.badImplementation(reason));
                    });
                } else {
                    reply(Boom.badRequest('Cannot verify the unique code'));
                }
            } else {
                reply(Boom.badRequest('Email not registered on platform'));
            }
        });
    }


    public getUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        console.log(request.auth.credentials.userId);
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
       this.database.user.findOne({
           where:{
               id:request.auth.credentials.userId
            }
        }).then((user)=>{
                if(user){
                    user.deleteUserData(request.auth.credentials.userId)
                        .then(() => {
                            return reply({
                                 deleted: true
                             });
                        });
                }
                else{
                  return reply(Boom.badRequest('User not found'));
                }
             });
    }

    public pushNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
          this.database.user.findOne({
           where:{
               id:request.auth.credentials.userId
            }
        }).then((user)=>{
                        if(user){
                            user.pushNotification(request.payload.pushNotif)
                                .then(() => {
                                    return reply({
                                                changed: true
                                    });
                                });
                            }
                         else{
                            return reply(Boom.badRequest('User not found'));
                           }
                        });
    }

    public emailNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
           this.database.user.findOne({
           where:{
               id:request.auth.credentials.userId
            }
        }).then((user)=>{
                        if(user){
                            user.emailNotification(request.payload.emailNotif)
                                .then(() => {
                                    return reply({
                                                changed: true
                                    });
                                });
                            }
                         else{
                             return reply(Boom.badRequest('User not found'));
                           }
                        });
    }

    public updateUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
       this.database.user.findOne({
           where:{
               id:request.auth.credentials.userId
            }
        }).then((user) => {
            if(user){
                user.updateUser(request.payload)
                    .then(() => {
                                    return reply({
                                                updated: true
                                    });
                                });
            }
            else{
                return reply(Boom.badRequest('User not found'));
            }
        }).catch((err) => {
            reply(Boom.conflict('failed to update the user info'));
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
       this.database.user.findAll().then((user)=>{console.log(user); });
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
