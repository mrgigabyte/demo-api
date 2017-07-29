'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return [queryInterface.addColumn('users', 'resetPasswordCode', {
            type: Sequelize.STRING(30),
            allowNull: true,
            validate: {
                notEmpty: true
            }
        }), queryInterface.addColumn('users', 'resetCodeExpiresOn', {
            type: Sequelize.DATE,
            allowNull: true,
            validate: {
                notEmpty: true
            }
        })]
    },

    down: function(queryInterface, Sequelize) {
        return [queryInterface.removeColumn('users', 'resetPasswordCode'), queryInterface.removeColumn('users', 'resetCodeExpiresOn')];
    }
};