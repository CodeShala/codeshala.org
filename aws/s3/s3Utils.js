/*
Utility class for uploading file in S3.

@author chandan
*/

const AWS = require('aws-sdk');
const fs =  require('fs');
const log = require('../../log/log.js');

const s3 = new AWS.S3();

module.exports = {

    /**
     *  Create bucket.
     * @param bucketName
     * @param callback
     */
     createBucket : function(bucketName, callback) {
        s3.createBucket({Bucket: bucketName}, function (err, data) {
            if (err) {
                log.error(err);
            }
            else {
                log.info("Successfully created bucket " + bucketName);
            }
            return callback(err, data);
        });
    },

    /**
     * Upload content in S3 bucket.
     *
     * @param bucketName
     * @param fileName
     * @param body
     * @param callback
     */
    putObjectInBucket : function(bucketName, fileName, body, callback) {
        var params = {Bucket: bucketName, Key: fileName, Body: body};
        module.exports.putObjectInBucket(params, function (err, data) {
            return callback(err, data);
        });
    },

    /**
     * Upload content in S3 bucket.
     *
     * @param params
     * @param callback
     */
    putObjectInBucket : function(params, callback) {
        s3.putObject(params, function (err, data) {
            if (err)
                log.error(err);
            else
                log.info("Successfully uploaded data to " + params.Bucket + "/" + params.Key);
            return callback(err, data);
        });
    },

    /**
     * Create bucket and upload objects, if bucket is already created then it will skip the
     * creation else it will create the bucket and upload the file.
     *
     * @param bucketName
     * @param fileName
     * @param body
     * @param callback
     */
    putObject : function(bucketName, fileName, body, callback) {
        var params = {Bucket: bucketName, Key: fileName, Body: body};
        module.exports.putObjectInBucket(params, function (err, data) {
            if (err) {
                log.error(err.code);
                switch (err.code) {
                    case 'NoSuchBucket':
                        log.info("Bucket is not present, creating bucket");
                        module.exports.createBucket(bucketName, function (err, data) {
                            if (err) {
                                log.error("Not able to create bucket, error occurred: " + err);
                            } else {
                                log.info("Uploading content into bucket: " + bucketName);
                                module.exports.putObjectInBucket(params, function (err, data) {
                                    return callback(err, data);
                                });
                            }
                        });
                        break;
                    default:
                        log.error("putObjectInBucket operation failed!! " + err);
                        return callback(err, data);
                }
            } else {
                log.info("Successfully uploaded data to " + bucketName + "/" + fileName);
            }
            return callback(err, data);
        });
    },

    /**
     * Upload object in bucket.
     *
     * @param params eg: var params = {Bucket: bucketName, Key: fileName, Body: body};
     * @param options eg: var options = {partSize: 5*1024*1024, queueSize : 5};
     * @param callback
     */
    uploadObject : function (params, options, callback) {
        s3.upload(params, options, function (err, data) {
            return callback(err, data);
        });
    },

    /**
     * Upload object in bucket with concurrency. Uploading with concurrency of 5 and
     * partSize 5 MB.
     *
     * @param bucketName
     * @param fileName
     * @param body
     * @param callback
     */
    uploadObjectWithConcurrency: function (bucketName, fileName, body, callback) {
        var params = {Bucket: bucketName, Key: fileName, Body: body};
        var options = {partSize: 5*1024*1024, queueSize : 5};
        s3.upload(params, options, function (err, data) {
            return callback(err, data);
        });
    },

    /**
     * Upload file in S3 bucket.
     *
     * @param bucketName
     * @param filePath
     * @param callback
     */
    uploadFile: function (bucketName, filePath, callback) {
        fs.readFile(filePath, function (err, fileData) {
            if (err) {
                log.error(err);
                throw err;
            }
            var params = {Bucket: bucketName, Key: filePath, Body: fileData};
            module.exports.putObjectInBucket(params, function (err, response) {
                return callback(err, response);
            });
        });
    },

    /**
     * Upload file in S3 bucket.
     *
     * @param bucketName
     * @param filePath
     * @param fileDate
     * @param callback
     */
    uploadFile: function (bucketName, filePath, fileData, callback) {
        var params = {Bucket: bucketName, Key: filePath, Body: fileData};
        module.exports.putObjectInBucket(params, function (err, response) {
            return callback(err, response);
        });
    },

    /**
     * Get object from S3 bucket.
     *
     * @param bucketName
     * @param key
     * @param callback
     */
    getObject: function (bucketName, key, callback) {
        var params = {Bucket: bucketName, Key: key};
        s3.getObject(params, function(err, response) {
            return callback(err, response);
        });
    }
};
