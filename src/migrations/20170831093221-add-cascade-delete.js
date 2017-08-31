'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return (
      queryInterface.addConstraint('resetCodes', ['userId'], {
        type: 'FOREIGN KEY',
        name: 'custom_fkey_userId',
        references: { //Required field
          table: 'users',
          field: 'id'
        },
        onDelete: 'cascade',
        onUpdate: 'cascade'
      }),
      queryInterface.removeConstraint('resetCodes', 'resetCodes_ibfk_1')
    );
  },

  down: function (queryInterface, Sequelize) {
    return (queryInterface.addConstraint('resetCodes', ['userId'], {
      type: 'FOREIGN KEY',
      name: 'resetCodes_ibfk_1',
      references: { //Required field
        table: 'users',
        field: 'id'
      },
      onUpdate: 'cascade'
    }), queryInterface.removeConstraint('resetCodes', 'custom_fkey_userId'));
  }
};
