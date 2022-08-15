const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
//this will add to the Schema a username and a password and make sure that the usernames are different
UserSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User' , UserSchema)