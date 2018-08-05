var mongoose = require('mongoose');

mongoose.connect(process.env.MLAB_DB_URI);

var db = mongoose.connect;

var Campus_ambassadorSchema = mongoose.Schema({
    name: {
        type: String
    },
    mobile: {
        type: String
    },
    email: {
        type: String
    },
    college: {
        type: String
    },
    state: {
        type: String
    },
    branch: {
        type: String
    },
    year_of_graduation: {
        type: String
    },
    codeshala_student: {
        type: String
    },
    any_society: {
        type: String
    },
    social_links: {
        type: String
    },
    other_profile: {
        type: String
    },
    why_you: {
        type: String
    },
    new_idea: {
        type: String
    },
    additional_info: {
        type: String
    },
    status: {
        type: String
    }

});
var Campus_ambassador = module.exports = mongoose.model('Campus_ambassador', Campus_ambassadorSchema);
module.exports.createCampus_ambassador = function (newCampus_ambassador, callback) {
    newCampus_ambassador.save(callback);
};