"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Sequelize = require("sequelize");
function default_1(sequelize, DataTypes) {
    const Story = sequelize.define('story', {
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
    return Story;
}
exports.default = default_1;
//# sourceMappingURL=stories.js.map