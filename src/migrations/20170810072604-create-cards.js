'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('cards', {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            order: {
                type: Sequelize.INTEGER(5),
                allowNull: false,
                validate: {
                    notEmpty: true
                },
            },
            mediaUri: {
                type: Sequelize.STRING(100),
                allowNull: false,
                validate: {
                    notEmpty: true,
                    isUrl: true
                }
            },
            mediaType: {
                type: Sequelize.ENUM('image', 'video'),
                allowNull: false,
            },
            externalLink: {
                type: Sequelize.STRING(100),
                allowNull: true,
                validate: {
                    isUrl: true
                }
            },
            storyId: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                references: {
                    model: 'stories',
                    key: 'id',
                    as: 'storyId',
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('cards');
    }
};