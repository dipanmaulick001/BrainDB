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

const contentTypes = ['image' , 'video' , 'documents' , 'article' , 'audio'];

const contentSchema = new mongoose.Schema({
    link : {type : String , required : true},
    tags : [{type : mongoose.Types.ObjectId , ref : TagModel}],
    type : {type : String, required : true, enum : contentTypes },
    title : {type : String, required : true},
    userId : [{type : Types.ObjectId , required : true , ref : UserModel}]
})

export const ContentModel = mongoose.model("contents" , contentSchema);

const linkSchema = new mongoose.Schema({
    hash : {type : String , required : true},
    userId : [{type : Types.ObjectId , ref : UserModel}]
})

export const LinkModel = mongoose.model("links" , linkSchema);


//export {
  //UserModel,
  //ContentModel,
  //TagModel,
  //LinkModel
//};

//export const usrrmodel = ...





