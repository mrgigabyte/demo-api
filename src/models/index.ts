import * as fs from 'fs';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import { IDb } from "../config";

const basename = path.basename(module.filename);
let env = process.env.NODE_ENV || 'development';
let config = require(path.join(__dirname, `../config/config.${process.env.NODE_ENV || "dev"}.json`));
let db: any = {};
let sequelize: Sequelize.Sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: config.pool,
});
fs.readdirSync(__dirname)
    .filter((file) => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach((file) => {
        let model = sequelize['import'](path.join(__dirname, file));
        db[model['name']] = model;
    });

for (let model in db) {
    if (db.hasOwnProperty(model)) {
        try {
            db[model].associate(db);
        } catch (error) {
            console.log(model + ' model doesnt have any assosciations');
        }
    }
}

db['sequelize'] = sequelize;
db['Sequelize'] = Sequelize;
export default db;