import mongoose from "mongoose";

export const connection = ()=>{
    mongoose.connect(process.env.MongoDB_URL, {
        dbName: "MERN_AUTHENTICATION",

    }).then(()=>{
        console.log("Database connected successfully");
    }).catch((error)=>{
        console.log("Database connection failed", error);
    })
}