"use strict";
module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
            defaultValue: ''
        },
        email: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: ''
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive', 'deleted'),
            allowNull: false,
            defaultValue: 'active'
        },
        emailNotif: DataTypes.ENUM('enable', 'disable'),
        pushNotif: DataTypes.ENUM('disable', 'morning', 'night', 'day'),
        joinedOn: DataTypes.DATE,
        deleteOn: DataTypes.DATE
    }, {
        classMethods: {
            associate: function(models) {}
        }
    });
    return User;
};