'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addConstraint('users', ['email'], {
            type: 'unique',
            name: 'unique_email'
        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeConstraint('users', 'unique_email');
    }
};