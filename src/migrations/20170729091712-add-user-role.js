'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addColumn('users', 'role', {
            type: Sequelize.ENUM('god', 'jesus', 'romans'),
            allowNull: false,
            validate: {
                notEmpty: true,
            },
            defaultValue: 'romans'
        })
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeColumn('users', 'role')
    }
};