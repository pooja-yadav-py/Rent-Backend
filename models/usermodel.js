const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    fullName:{
        type: String,
        required :true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    refreshToken:{ 
        type: String 
    },
    is_verified:{
        type: Boolean,
        default: false
    }
})

const UserModel = mongoose.model('users',userSchema);
module.exports = UserModel;
