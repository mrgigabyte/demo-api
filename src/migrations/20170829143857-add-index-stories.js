'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return (queryInterface.addIndex('stories', ['id', 'publishedAt']),
      queryInterface.addIndex('stories', ['id', 'createdAt']))
  },

  down: function (queryInterface, Sequelize) {
    return (queryInterface.removeIndex('stories', ['id', 'publishedAt']),
    queryInterface.removeIndex('stories', ['id', 'createdAt']))
  }
};
