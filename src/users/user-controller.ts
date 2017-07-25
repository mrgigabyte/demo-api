import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";
import * as GoogleAuth from "google-auth-library";
import * as json2csv from "json2csv";

import { IServerConfigurations } from "../configurations";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;
    private dummyData: any;

    constructor(configs: IServerConfigurations, database: any) {
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
        return reply({
            "res": true
        });
    }

    public checkEmail(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true
        });
    }

    public login(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let token1 = Jwt.sign({ role: 'GOD', id: '123' }, this.configs.jwtSecret, { expiresIn: this.configs.jwtExpiration });
        let token2 = Jwt.sign({ role: 'JESUS', id: '123' }, this.configs.jwtSecret, { expiresIn: this.configs.jwtExpiration });
        let token3 = Jwt.sign({ role: 'ROMANS', id: '123' }, this.configs.jwtSecret, { expiresIn: this.configs.jwtExpiration });
        return reply({
            "jwtGod": token1,
            "jwtJesus": token2,
            "jwtRomans": token3
        });
    }

    public requestResetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true
        });
    }

    public resetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true
        });
    }


    public getUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "user": {
                "id": "2",
                "name": "John Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "false",
                "pushNotif": "morning",
                "joinedOn": "2017-07-22T07:15:13.250Z"
            }
        });
    }

    public deleteProfile(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true
        });
    }

    public pushNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true
        });
    }

    public emailNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true
        });
    }

    public updateUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": true,
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

    public getAllUsersCsv(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let fields = ['id', 'name', 'email', 'emailNotif', 'pushNotif'];
        let res = json2csv({data: this.dummyData, fields: fields});
        console.log(res);        
        return reply(res)
                .header('Content-Type', 'application/octet-stream')
                .header('content-disposition', 'attachment; filename=users.csv;');
    }

}
