import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';
import * as GoogleCloudStorage from "@google-cloud/storage";

export default function (sequelize, DataTypes) {
    let Card = sequelize.define('card',
        {
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
                unique: 'compositeOrder'
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
                unique: 'compositeOrder',
                allowNull: false
            }
        }, {});
    Card.associate = function (models) {
        models.card.belongsToMany(models.user, {
            through: 'favouriteCards',
            scope: {
                status: 'active'
            }
        });
    };

    /**
     * Helper function for generating UUID.
     * I generate the UID from two parts here to ensure the random number provide enough bits.
     */
    let generateUID = function () {
        let firstPart = ((Math.random() * 46656) | 0).toString(36);
        let secondPart = ((Math.random() * 46656) | 0).toString(36);
        firstPart = ("000" + firstPart).slice(-3);
        secondPart = ("000" + secondPart).slice(-3);
        return firstPart + secondPart;
    };

    Card.uploadCard = function (fileData, config, mediaType) {
        let gcs = GoogleCloudStorage({
            projectId: config.projectId,
            keyFilename: __dirname + '/../' + config.keyFilename
        });

        let bucket = gcs.bucket(config.cardsBucket);

        let name = generateUID() + '.' + fileData.hapi.filename;
        name = name.replace(/ /g, '');
        let filePath = 'cards/' + name;
        let file = bucket.file(filePath);

        return new Promise((resolve, reject) => {
            let stream = file.createWriteStream({
                metadata: {
                    contentType: fileData.hapi.headers['content-type']
                }
            });
            stream.on('error', (err) => {
                reject("There was some problem uploading the file. Please try again.");
            });
            stream.on('finish', () => {
                resolve({
                    "mediaUri": "https://storage.googleapis.com/" + config.cardsBucket + '/' + filePath,
                    "mediaType": mediaType
                });
            });
            stream.end(fileData._data);
        });
    };

    Card.prototype.toggleFav = function (userId, userModel): Promise<boolean> {
        return userModel.findById(userId).then((user) => {
            return this.hasUser(user).then((result) => {
                if (result) {
                    this.removeUser(user);
                    return Promise.resolve(false);
                } else {
                    this.addUser(user);
                    return Promise.resolve(true);                    
                }
            });
        });
    };


    return Card;
}