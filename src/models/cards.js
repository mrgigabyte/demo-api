"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
function default_1(sequelize, DataTypes) {
    const Card = sequelize.define('card', {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        classMethods: {
            associate: function (models) { }
        }
    });
    return Card;
}
exports.default = default_1;
//# sourceMappingURL=cards.js.map