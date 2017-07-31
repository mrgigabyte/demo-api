'use strict';

module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('resetCodes', {
            id: {
                type: Sequelize.INTEGER(11),
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            code: {
                type: Sequelize.STRING(150),
                allowNull: true,
                validate: {
                    notEmpty: true
                }
            },
            expiresAt: {
                type: Sequelize.DATE,
                allowNull: true,
                validate: {
                    notEmpty: true
                }
            },
            userId: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                onDelete: 'CASCADE',
                references: {
                    model: 'users',
                    key: 'id',
                    as: 'userId',
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
        return queryInterface.dropTable('resetCodes');
    }
};