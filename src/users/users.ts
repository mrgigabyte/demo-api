import * as Sequelize from 'sequelize';

export default function (sequelize: Sequelize.Sequelize, DataTypes) {
    const User = sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER(11),
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: Sequelize.STRING(150),
            allowNull: false,
            defaultValue: ''
        },
        email: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: ''
        },
    }, {
            classMethods: {
                associate: function (models) { }
            }
        });
    return User;
}



//  id: Joi.number().required(),
//     name: Joi.string().required(),
//     email: Joi.string().email().required(),
//     emailNotif: Joi.boolean().required(),
//     pushNotif: Joi.string().required()
//         .valid(['disable', 'morning', 'afternoon', 'night']),
//     joinedOn: Joi.date().required()

// export const userSchema: Joi.ObjectSchema = Joi.object({
//     id: Joi.number().required(),
//     name: Joi.string().required(),
//     email: Joi.string().email().required(),
//     emailNotif: Joi.boolean().required(),
//     pushNotif: Joi.string().required()
//         .valid(['disable', 'morning', 'afternoon', 'night']),
//     joinedOn: Joi.date().required()
// });

// export const userAdminPannelSchema: Joi.ObjectSchema = userSchema.keys({
//     status: Joi.string().required()
//         .valid(['active', 'inactive', 'deleted']),
// });


