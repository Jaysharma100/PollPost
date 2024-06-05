import mongoose from "mongoose";

const userschema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    avatar:{
        type:String
    }
})

const model = mongoose.model('userdata',userschema)

export default model