import * as Hapi from "hapi";
import * as Boom from "boom";
// import * as Jwt from "jsonwebtoken";
// import * as GoogleAuth from "google-auth-library";

import { IServerConfigurations } from "../configurations";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;
    private user: any;

    constructor(configs: IServerConfigurations, database: any) {
        this.database = database;
        this.configs = configs;
    }

    public latest(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public archived(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }
     public getStories(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public saveStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }
     public updateStory(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public pushLive(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }
     public preview(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

}
