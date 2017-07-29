import * as Sequelize from 'sequelize';

export default function (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes) {
    var User = sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true,
            allowNull: false,
        },
        name: {
            type: Sequelize.STRING(150),
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        password: {
            type: Sequelize.STRING(50),
            allowNull: false,
        },
        status: {
            type: Sequelize.ENUM('active', 'inactive', 'deleted'),
            allowNull: false,
            defaultValue: 'active'
        },
        emailNotif: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        pushNotif: {
            type: Sequelize.ENUM('disable', 'morning', 'night', 'day'),
            allowNull: false,
            defaultValue: 'disable'
        },
        deleteOn: {
            type: Sequelize.DATE,
            allowNull: true            
        }
    }, {
            classMethods: {
                associate: function (models) { }
            }
        });
    return User;
};