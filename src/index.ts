import express from "express";
const app = express();

app.use(express.json());

import {UserModel} from "./db.js"
import { ContentModel , TagModel , LinkModel} from "./db.js";
import z from "zod";
import bcrypt from "bcrypt";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import {JWT_SECRET} from "./config.js"
import { userMiddleware } from "./middleware.js";

app.post("/api/v1/signup" , async (req , res)=>{
    //zod validation
    const requiredBody = z.object({
        username : z.string()
            .min(3,"username should be atleast 3 characters")
            .max(10,"username cannot be longer than this"),
        password : z.string()
            .min(8,"Password should be atleast of 8 characters")
            .max(20, "Password cannot be longer than 20 characters")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/,
                "Password must have atleast one uppercase, one lowercase, one special character, one number"
            )
    })

    const parsed = requiredBody.safeParse(req.body);

    if(!parsed.success){
        res.status(400).json({
            message : "input validation failed",
            errors : parsed.error.issues
        })
    }
    //if validation succeeds

    const username = req.body.username;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password,10);

    try{
        await UserModel.create({
            username : username,
            password : hashedPassword //hash the password
    })
        res.json({
        message : "User signed up"
    })
    }catch(e){
        res.status(411).json({
            message : "user already exists"
        })
    }
    

    
})

app.post("/api/v1/login" , async ( req ,res) =>{
    const username = req.body.username;
    const password = req.body.password;

    const existingUser = await UserModel.findOne({
                username
    })

    if(!existingUser){
        res.status(403).json({
            message : "invalid credentials"
        })
    }
    //if we find the username, then we comapre passwords
    const passwordMatch = await bcrypt.compare(password , existingUser?.password as string );

    if(!passwordMatch){
        res.status(403).json({
            message : "password doesnt match"
        })
    }

    const token = jwt.sign({
        userId : existingUser?._id
    },JWT_SECRET);

    res.json({
        token 
    })
    
})

app.post("/api/v1/content" ,userMiddleware ,async (req ,res)=>{
    //userId from middleware
        const {link ,  type , title} = req.body;

        await ContentModel.create({
            link,
            //@ts-ignore
            userId : req.userId,
            type,
            tags : [],
            title
        })

        res.json({
            message : "content added"
        })
})

app.get("/api/v1/content" , userMiddleware, async ( req ,res)=>{
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId : userId
    }).populate("userId" , "username"); //just show the username

    res.json({
        content
    })
    //we see the userId returned 
})

app.delete("/api/v1/content" , userMiddleware ,async (req ,res)=>{
    const contentId = req.body.contentId;

    await ContentModel.deleteMany({
        contentId,
        //@ts-ignore
        userId : req.userId

    })

    res.json({
        message : "deleted"
    })

})

app.post("/api/v1/braindb/share" , (req ,res)=>{

})

app.get("/api/v1/braindb/:sharedLink" , (req ,res)=>{

})

app.listen(3000);







