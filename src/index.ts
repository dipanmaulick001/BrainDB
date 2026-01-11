import express from "express";
const app = express();

app.use(express.json());

import {UserModel} from "./db.js"
import { ContentModel , TagModel , LinkModel} from "./db.js";
import z from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto"

import mongoose, { type ObjectId } from "mongoose";
import jwt from "jsonwebtoken";

import {JWT_SECRET} from "./config.js";
import { PORT } from "./config.js";
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
         return res.status(400).json({
            message : "input validation failed",
            errors : parsed.error.issues
        })
    }
    //if validation succeeds

    const {username, password} = parsed.data; //parsed.data instead of req.body 

    const hashedPassword = await bcrypt.hash(password,10);

    try{
        await UserModel.create({
            username : username,
            password : hashedPassword //hash the password
    })
        return res.json({
        message : "User signed up"
    })
    }catch(e){
        return res.status(409).json({
            message : "user already exists"
        })
    }
})

app.post("/api/v1/login" , async ( req ,res) =>{
    const {username , password} = req.body;

    const existingUser = await UserModel.findOne({
                username
    })

    if(!existingUser){
        return res.status(403).json({
            message : "invalid credentials"
        })
    }
    //if we find the username, then we compare passwords
    const passwordMatch = await bcrypt.compare(password , existingUser?.password as string );

    if(!passwordMatch){
        return res.status(403).json({
            message : "invalid credentials"
        })
    }

    const token = jwt.sign({
        userId : existingUser?._id
    },JWT_SECRET);

    return res.json({
        token 
    })
    
})

//tag endpoint : add tags
app.post("/api/v1/tags" , userMiddleware, async (req ,res)=>{

    const title = req.body.title;

    if(!title){
        return res.status(400).json({
                message : "title required"
        })
    }

    const tag = await TagModel.create({
        title : title
    })

    return res.json({
        tag
    })
})



app.post("/api/v1/content" ,userMiddleware ,async (req ,res)=>{
    //userId from middleware
        const {link ,  type , title ,tags} = req.body;

        await ContentModel.create({
            link,
            //@ts-ignore
            userId : req.userId,
            type,
            tags , //use tags
            title
        })

        return res.json({
            message : "content added"
        })
})

app.get("/api/v1/content" , userMiddleware, async ( req ,res)=>{
    //@ts-ignore
    const userId = req.userId;
    const content = await ContentModel.find({
        userId : userId
    })
        .populate("userId" , "username") //only show username
        .populate("tags" , "title") //show title of tags
        
    return res.json({
        content
    })
    //we see the userId returned 
})

app.delete("/api/v1/content" , userMiddleware ,async (req ,res)=>{
    const contentId = req.body.contentId;

    await ContentModel.deleteOne({ //deleteMany is too dangerous
        _id : contentId,
        //@ts-ignore
        userId : req.userId

    })

    return res.json({
        message : "deleted"
    })

})

app.post("/api/v1/braindb/share" , userMiddleware,  async (req ,res)=>{
        const hash = crypto.randomBytes(16).toString("hex");

        const myLink = await LinkModel.findOneAndUpdate(
            //@ts-ignore
            {userId : req.userId},
            {hash},
            {upsert : true, new : true}
        )
        
        if(!myLink){
            return res.status(500).json({
                message : "could not generate link"
            })
        }

        return res.json({
            fullLink : `${req.protocol}://${req.get("host")}/api/v1/braindb/${myLink.hash}`
        })
})

app.get("/api/v1/braindb/:sharedLink", async (req, res) => {
        const hash = req.params.sharedLink;

        const linkDoc = await LinkModel.findOne({ hash });
        if (!linkDoc || !linkDoc.userId) { //now ts knows linkDoc.userId exists
            return res.status(404).json({ message: "Invalid or expired link" });
        }

        const contents = await ContentModel.find({ userId: linkDoc.userId }) 
            .populate("tags")
            .select("title link type tags");

        return res.json({ contents });
});


app.listen(PORT, ()=>{
    console.log(`Listening to port ${PORT}`)
});
