var dynamo = require('dynamodb');
var Joi = require('joi');


dynamo.AWS.config.update({accessKeyId: process.env.AWS_ACCESS_ID_KEY,
 secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
 region: process.env.AWS_REGION
});

exports.course =  dynamo.define('Course', {
  hashKey : 'alias',
  timestamps : true,
  schema : {
    alias   : Joi.string(),
    name : Joi.string(),
    minsessions    : Joi.number(),
    maxsessions     : Joi.number(),
    fees     : Joi.number(),
    seats     : Joi.number(),
    description     : Joi.string(),
    courseCurriculum    : Joi.string(),
    courseScope     : Joi.string(),
    courseRegistrationStatus     : Joi.string()
  }
});