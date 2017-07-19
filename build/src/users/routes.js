"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = require("joi");
const user_controller_1 = require("./user-controller");
const schemas_1 = require("./schemas");
function default_1(server, serverConfigs, database) {
    const userController = new user_controller_1.default(serverConfigs, database);
    server.bind(userController);
    server.route({
        method: 'GET',
        path: '/try',
        handler: userController.try
    });
    server.route({
        method: 'POST',
        path: '/users/auth/google',
        config: {
            description: 'Get a JWT for a user using his short lived google access token.',
            validate: {
                payload: Joi.object({
                    idToken: Joi.string().required()
                        .description("Short lived access token provided by google web-sign in.")
                        .default("aaa.bbb.ccc")
                })
            },
            response: {
                schema: Joi.object({
                    "user": schemas_1.userSchema,
                    "jwt": Joi.string().required()
                        .default("xxx.yyy.zzz")
                        .description("Will authenticate all the future requests.")
                })
            },
            plugins: {
                'hapi-swagger': {
                    responses: {
                        '200': {
                            'description': 'User already existed and successfully authenticated.'
                        },
                        '201': {
                            'description': 'New user created and successfully authenticated.'
                        },
                        '401': {
                            'description': 'Auth failiure. Wrong ID token.'
                        }
                    }
                }
            },
            tags: ['api'],
        }
    });
}
exports.default = default_1;
//# sourceMappingURL=routes.js.map