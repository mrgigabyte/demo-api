import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";
import * as GoogleAuth from "google-auth-library";

import { IServerConfigurations } from "../configurations";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;

    constructor(configs: IServerConfigurations, database: any) {
        this.database = database;
        this.configs = configs;
    }

    public signup(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": "Successfully created a new user"
        });
    }

    public login(request: Hapi.Request, reply: Hapi.Base_Reply) {
        let token1 = Jwt.sign({ role: 'GOD', id: '123' }, this.configs.jwtSecret, { expiresIn: this.configs.jwtExpiration });
        let token2 = Jwt.sign({ role: 'JESUS', id: '123' }, this.configs.jwtSecret, { expiresIn: this.configs.jwtExpiration });
        let token3 = Jwt.sign({ role: 'ROMANS', id: '123' }, this.configs.jwtSecret, { expiresIn: this.configs.jwtExpiration });
        return reply({
            "jwtGod": token1,
            "jwtJESUS": token2,
            "jwtRomans": token3
        });
    }

    public requestResetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": "successfully sent the email containing the reset link"
        });
    }

    public resetPassword(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": "successfully changed the password"
        });
    }


    public getUserInfo(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "user": {
                "id": "2",
                "name": "John Doe",
                "email": "john.doe@gmail.com",
                "emailNotif": "false",
                "pushNotif": "morning"
            }
        });
    }

    public deleteProfile(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": "successfully deleted the profile"
        });
    }

    public pushNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": "successfully changed the push notification setting"
        });
    }

    public emailNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        return reply({
            "res": "successfully changed the email notification setting"
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
            "data": [
                {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }, {
                    "id": "2",
                    "name": "Johnny Doe",
                    "email": "john.doe@gmail.com",
                    "emailNotif": "true",
                    "pushNotif": "morning"
                }
            ]
        });
    }

}
