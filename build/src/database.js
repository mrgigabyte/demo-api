"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
function init(config) {
    let sequelize = new Sequelize(config.database, config.user, config.password, {
        host: config.host,
        dialect: config.client,
        pool: config.pool,
        define: {
            timestamps: false // true by default
        }
    });
    let db = {};
    const basename = path.basename(module.filename);
    const Modles = config.models;
    Modles.forEach(model => {
        let modelPath = __dirname + '/' + model;
        fs.readdirSync(modelPath)
            .filter(function (file) {
            return (file.indexOf('.') !== 0) && (file !== basename) &&
                (file.slice(-3) === '.js') && (file.slice(0, -3) === model);
        })
            .forEach(function (file) {
            const model = sequelize['import'](path.join(modelPath, file));
            // NOTE: you have to change from the original property notation to
            // index notation or tsc will complain about undefined property.
            db[model['name']] = model;
        });
        Object.keys(db).forEach(function (modelName) {
            if (db[modelName].associate) {
                db[modelName].associate(db);
            }
        });
    });
    db['sequelize'] = sequelize;
    db['Sequelize'] = Sequelize;
    return db;
}
exports.init = init;
//# sourceMappingURL=database.js.map