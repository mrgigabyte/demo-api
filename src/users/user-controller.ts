import * as Hapi from "hapi";
import * as Boom from "boom";
import { IServerConfigurations } from "../config";
import { IDb } from "../config";
export default class UserController {

    private configs: IServerConfigurations;
    private database: IDb;

    constructor(configs: IServerConfigurations, database: IDb) {
        this.database = database;
        this.configs = configs;
    }

    public signup(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.create(request.payload).then((user: any) => {
            return reply({
                "success": true
            }).code(201);
        }).catch((err) => {
            if (err.parent.errno === 1062) {
                reply(Boom.conflict('User with the given email already exists'));
            } else {
                return reply(err);
            }
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
        }).catch(err => reply(err));
    }

    public login(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            },
            attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn'], 'password', 'role'],
        }).then((user: any) => {
            if (user) {
                if (user.checkPassword(request.payload.password)) {
                    let User: any = user.get({ plain: true });
                    let jwt = user.generateJwt(this.configs);
                    delete User['password']; // remove password and role from the user object
                    delete User['role'];
                    return reply({
                        "jwt": jwt,
                        "user": User
                    });
                } else {
                    reply(Boom.unauthorized('Password is incorrect.'));
                }
            } else {
                reply(Boom.unauthorized('Email or Password is incorrect.'));
            }
        }).catch(err => reply(err));
    }

    public requestResetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            }
        }).then((user: any) => {
            if (user) {
                return user.generatePasswordResetCode(this.database.resetCode);
            } else {
                reply(Boom.notFound('Email not registered on platform'));
            }
        }).then((code: string) => {
            // TODO: send email to the user after generating the code.
            return reply({
                "code": code
            });
        }).catch(err => reply(err));
    }

    public resetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                email: request.payload.email
            }
        }).then((user: any) => {
            if (user) {
                return user.resetPassword(this.database.resetCode, request.payload.code, request.payload.password);
            } else {
                return reply(Boom.notFound('Email not registered on platform'));
            }
        }).then(() => {
            return reply({
                reset: true
            });
        }).catch(err => reply(err));
    }

    public getUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            attributes: ['id', 'name', 'email', 'emailNotif', 'pushNotif', ['createdAt', 'joinedOn'], 'status'],
            where: {
                id: request.params.userId
            }
        }).then((user: any) => {
            if (user) {
                return reply({
                    "user": user.get({ plain: true })
                });
            } else {
                reply(Boom.notFound('User not found'));
            }
        }).catch(err => reply(err));
    }
    public getMyDetails(request: Hapi.Request, reply: Hapi.Base_Reply) {
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
        }).catch(err => reply(err));
    }

    public softDeleteUser(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user: any) => {
            if (user) {
                return user.softDeleteUser();
            } else {
                return reply(Boom.notFound('User not found'));
            }
        }).then(() => {
            return reply({
                "deleted": true
            });
        }).catch(err => reply(err));
    }

    public updateUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.findOne({
            where: {
                id: request.auth.credentials.userId
            }
        }).then((user: any) => {
            if (user) {
                return user.updateUserInfo(request.payload);
            } else {
                return reply(Boom.notFound('User not found'));
            }
        }).then((res) => {
            return reply({
                "updated": true
            });
        }).catch(err => reply(err));
    }

    public getAllPaginatedUsers(request: Hapi.Request, reply: Hapi.Base_Reply) {
        this.database.user.getAllPaginatedUsers(request.query.size, request.query.page, this.configs.baseUrl).then((response: any) => {
            return reply(response);
        }).catch(err => reply(err));
    }

    public generateCsvLink(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let jwttoken = this.database.user.generateJwtCsv(this.configs);
        let link: string = this.configs.baseUrl + '/user/downloadCsv?jwt=' + jwttoken;
        return reply({
            "link": link
        });
    }

    public downloadCsv(request: Hapi.Request, reply: Hapi.Base_Reply) {
        if (this.database.user.verifyJwtCsv(request.query.jwt, this.configs.jwtCsvSecret)) {
            return this.database.user.getCsv().then((csv: any) => {
                return reply(csv).header('Content-Type', 'text/csv')
                    .header('content-disposition', 'attachment; filename=users.csv;');
            }).catch(err => reply(err));
        } else {
            return reply(Boom.badRequest('The link has expired. Try downloading the file again.'));
        }
    }

    public createJesus(request: Hapi.Request, reply: Hapi.Base_Reply) {
        request.payload.role = 'jesus';
        this.database.user.create(request.payload).then((user: any) => {
            return reply({
                "success": true
            });
        }).catch((err) => {
            return reply(Boom.conflict('User data already exists.'));
        });
    }
}