import * as Sequelize from 'sequelize';
import * as bcrypt from 'bcryptjs';
import * as Jwt from "jsonwebtoken";
import * as shortid from 'shortid';
import * as moment from 'moment';
import * as zen from 'zencoder';
import * as GoogleCloudStorage from "@google-cloud/storage";
import * as Boom from 'boom';

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

    /**
     * Uploads a card to the card bucket and returns the url and filename on successful uplooad.
     */
    Card.uploadCard = function (fileData, config) {
        let gcs = GoogleCloudStorage({
            projectId: config.projectId,
            keyFilename: __dirname + '/../' + config.keyFilename
        });

        let bucket = gcs.bucket(config.cardBucket);
        let name: string = generateUID() + '.' + fileData.hapi.filename;
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
                reject(Boom.expectationFailed("There was some problem uploading the file. Please try again."));
            });
            stream.on('finish', () => {
                resolve({
                    gcsLink: "https://storage.googleapis.com/" + config.cardBucket + '/' + filePath,
                    fileName: name
                });
            });
            stream.end(fileData._data);
        });
    };

    /**
     * Encodes and uploads the video to gcs encoded video bucket.
     */
    Card.encodeVideo = function (gcsLink: string, fileName: string, apiKey: string, bucketName: string) {
        let client = zen(apiKey);
        return new Promise((resolve, reject) => {
            client.Job.create({
                "input": gcsLink,
                "outputs": [
                    {
                        "base_url": "gcs://" + bucketName + "/",
                        "filename": fileName,
                        "size": "1280x720",
                        "audio_bitrate": 160,
                        "max_video_bitrate": 5000,
                        "h264_profile": "main",
                        "h264_level": "3.1",
                        "max_frame_rate": 30
                    }
                ]
            }, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data.id);
                }
            });
        });
    };

    /**
     * Helper function that returns the location of the encoded video.
     * If a backup server is used then an error is returned. 
     */
    let getOutputUrl = function (client: any, id: number) {
        return new Promise((resolve: any, reject: any) => {
            client.Output.details(id, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if(!data.backup_server_used) {
                    resolve(data.url);
                    } else {
                        reject(Boom.expectationFailed('Failed to encode the video'));
                    }
                }
            });
        });

    };

    /**
     * Returns video location on successful encoding of the video. Else returns false.
     */
    Card.checkJobStatus = function (id: number, apiKey: string) {
        let client = zen(apiKey);
        return new Promise((resolve: any, reject: any) => {
            client.Job.progress(id, (err, data) => {
                if (err) {
                    reject(err);
                } else {
                    if (data.state === 'pending' || data.state === 'waiting' || data.state === 'processing') {
                        resolve({ "encoded": false });
                    } else if (data.state === 'finished') {
                        getOutputUrl(client, data.outputs[0].id).then((url: string) => {
                            resolve({
                                "encoded": true,
                                "mediaUri": url
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        reject(Boom.expectationFailed('Failed to encode the video'));
                    }
                }
            });
        });
    };

    /**
     * Marks a card as favourite if not favourited by the user.
     * Removes a card from favourites if already favourited by the user.
     */
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