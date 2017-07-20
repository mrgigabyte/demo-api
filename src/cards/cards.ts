import * as Sequelize from 'sequelize';

export default function (sequelize: Sequelize.Sequelize, DataTypes) {
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