'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(150),
                allowNull: false,
                defaultValue: ''
            },
            email: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: ''
            },
            password: {
                type: Sequelize.STRING(15),
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM('active', 'inactive', 'deleted'),
                allowNull: false,
                defaultValue: 'active'
            },
            emailNotif: Sequelize.ENUM('enable', 'disable'),
            pushNotif: Sequelize.ENUM('disable', 'morning', 'night', 'day'),
            joinedOn: Sequelize.DATE,
            deleteOn: Sequelize.DATE
        }, {
            classMethods: {
                associate: function(models) {}
            }
        });
        /*
          Add altering commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.createTable('users', { id: Sequelize.INTEGER });
        */
    },

    down: function(queryInterface, Sequelize) {
            return queryInterface.dropTable('Users');
        }
        /*
          Add reverting commands here.
          Return a promise to correctly handle asynchronicity.

          Example:
          return queryInterface.dropTable('users');
        */

};