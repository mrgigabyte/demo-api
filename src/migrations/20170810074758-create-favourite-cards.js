'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return (queryInterface.createTable('favouriteCards', {
                createdAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                updatedAt: {
                    allowNull: false,
                    type: Sequelize.DATE
                },
                cardId: {
                    type: Sequelize.INTEGER(11),
                    allowNull: false,
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    references: {
                        model: 'cards',
                        key: 'id',
                        as: 'cardId',
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
            queryInterface.addConstraint('favouriteCards', ['cardId', 'userId'], {
                type: 'primary key'
            }))
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('favouriteCards');
    }

};