import mongoose, { mongo, Types } from "mongoose";

mongoose.connect("");
//schemas and models 

const userSchema = new mongoose.Schema({
    username : {type: String , unique : true , required : true},
    password : {type : String , required : true}
})
const UserModel = mongoose.model("users" , userSchema);

const tagSchema = new mongoose.Schema({
    title : {type : String , required : true}
})

const TagModel = mongoose.model("tags" , tagSchema);

const contentTypes = ['image' , 'video' , 'documents' , 'article' , 'audio'];

const contentSchema = new mongoose.Schema({
    link : {type : String , required : true},
    tag : [{type : mongoose.Types.ObjectId , ref : TagModel}],
    type : {type : String, required : true, enum : contentTypes },
    title : {type : String, required : true},
    userId : [{type : Types.ObjectId , required : true , ref : UserModel}]
})

const ContentModel = mongoose.model("contents" , contentSchema);

const linkSchema = new mongoose.Schema({
    hash : {type : String , required : true},
    userId : [{type : Types.ObjectId , ref : UserModel}]
})

const LinkModel = mongoose.model("links" , linkSchema);


export {
  UserModel,
  ContentModel,
  TagModel,
  LinkModel
};

//export const usrrmodel = ...





