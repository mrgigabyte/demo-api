import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";
import * as GoogleAuth from "google-auth-library";

import { IServerConfigurations } from "../configurations";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;
    private user: any;

    constructor(configs: IServerConfigurations, database: any) {
        this.database = database;
        this.configs = configs;
    }

    public login(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public reset(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

     public signUp(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public profileGet(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }
     public pushNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public profileUpdate(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public profileDelete(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }
    public emailNotif(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

}
