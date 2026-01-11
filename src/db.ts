import mongoose, { mongo, Types } from "mongoose";

import { MONGO_URL } from "./config.js";

mongoose.connect(MONGO_URL);
//schemas and models 

const userSchema = new mongoose.Schema({
    username : {type: String , unique : true , required : true},
    password : {type : String , required : true}
})
export const UserModel = mongoose.model("users" , userSchema);

const tagSchema = new mongoose.Schema({
    title : {type : String , required : true}
})

export const TagModel = mongoose.model("tags" , tagSchema);

export const contentTypes = ['image' , 'video' , 'documents' , 'article' , 'audio'] as const

const contentSchema = new mongoose.Schema({
    link : {type : String , required : true},
    tags : [{type : mongoose.Schema.Types.ObjectId , ref : "tags"}],
    type : {type : String, required : true, enum : contentTypes },
    title : {type : String, required : true},
    userId : {type : mongoose.Schema.Types.ObjectId , required : true , ref : "users"}
})

export const ContentModel = mongoose.model("contents" , contentSchema);

const linkSchema = new mongoose.Schema({
    hash : {type : String , required : true , unique : true},
    userId : {type : mongoose.Schema.Types.ObjectId , ref : "users" , required : true , unique : true}
})

export const LinkModel = mongoose.model("links" , linkSchema);


//export {
  //UserModel,
  //ContentModel,
  //TagModel,
  //LinkModel
//};

//export const usrrmodel = ...





