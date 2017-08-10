'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.addConstraint('cards', ['order', 'storyId'], {
            type: 'unique',
            name: 'compositeOrder'
        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.removeConstraint('cards', 'compositeOrder');
    }
};