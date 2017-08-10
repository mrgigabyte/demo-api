'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return (queryInterface.createTable('readStories', {
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                storyId: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    references: {
                        model: 'stories',
                        key: 'id',
                        as: 'userId',
                    }
                },
                userId: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    references: {
                        model: 'users',
                        key: 'id',
                        as: 'userId',
                    }
                },
            }),
            queryInterface.addConstraint('readStories', ['userId', 'storyId'], {
                type: 'primary key'
            }))
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('readStories');
    }
};