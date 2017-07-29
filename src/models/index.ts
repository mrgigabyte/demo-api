import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { IDb } from "../config";

const basename = path.basename(module.filename);
let env = process.env.NODE_ENV || 'development';
let config = require(path.join(__dirname, `../config/config.${process.env.NODE_ENV || "dev"}.json`));
let db: IDb;
let sequelize: Sequelize.Sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: config.pool,
});
fs.readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(function (file) {
        var model = sequelize['import'](path.join(__dirname, file));
        db[model['name']] = model;
    });
Object.keys(db).forEach(function (modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
export default db;