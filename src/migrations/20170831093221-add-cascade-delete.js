'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.addConstraint('resetCodes', ['userId'], {
      type: 'FOREIGN KEY',
      name: 'custom_fkey_userId',
      references: { //Required field
        table: 'users',
        field: 'id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    });
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.removeConstraint('resetCodes', 'custom_fkey_userId');
  }
};
