import * as Sequelize from 'sequelize';

export default function (sequelize: Sequelize.Sequelize, DataTypes) {
    const User = sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: ''
        },
        name: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
        }
    }, {
            classMethods: {
                associate: function (models) { }
            }
        });
    return User;
}