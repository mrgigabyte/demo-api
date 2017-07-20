import * as Hapi from "hapi";
import * as Boom from "boom";
import * as Jwt from "jsonwebtoken";

import { IServerConfigurations } from "../configurations";


export default class UserController {

    private configs: IServerConfigurations;
    private database: any;
    private user: any;

    constructor(configs: IServerConfigurations, database: any) {
        this.database = database;
        this.configs = configs;
    }

    // public try(request: Hapi.Request, reply: Hapi.Base_Reply) {
    //     // console.log(this.database);
    //     const a = this.database.user.build({
    //         email: "vidur@navvv",
    //         name: "vidur singla",
    //         profilePicture: "dasas",
    //         googleUserId: 1234,
    //         facilitator: 1
    //     });
    //     a.save().then((res) => {
    //         console.log('very good');
    //         return reply(res);
    //     }).catch((err) => {
    //         console.log(err);
    //     });
    // }

    public favCard(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public getFavouriteCards(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }

    public upload(request: Hapi.Request, reply: Hapi.Base_Reply) {
        // empty
    }
}

