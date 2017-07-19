"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserController {
    constructor(configs, database) {
        this.database = database;
        this.configs = configs;
    }
    try(request, reply) {
        // console.log(this.database);
        const a = this.database.user.build({
            email: "vidur@navvv",
            name: "vidur singla",
            profilePicture: "dasas",
            googleUserId: 1234,
            facilitator: 1
        });
        a.save().then((res) => {
            console.log('very good');
            return reply(res);
        }).catch((err) => {
            console.log(err);
        });
    }
}
exports.default = UserController;
//# sourceMappingURL=user-controller.js.map