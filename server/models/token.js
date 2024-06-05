import mongoose from "mongoose";

const tokenschema = mongoose.Schema({
    token:{
        type:String,
        required:true
    }
})

const token = mongoose.model('token',tokenschema);

export default token;