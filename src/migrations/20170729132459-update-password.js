  'use strict';

  module.exports = {
      up: function(queryInterface, Sequelize) {
          return queryInterface.changeColumn(
              'users',
              'password', {
                  type: Sequelize.STRING(70),
                  allowNull: false,
                  validate: {
                      notEmpty: true
                  }
              }
          )
      },

      down: function(queryInterface, Sequelize) {
          return queryInterface.changeColumn(
              'users',
              'password', {
                  type: Sequelize.STRING(50),
                  allowNull: false,
                  validate: {
                      notEmpty: true
                  }
              }
          )
      }
  };