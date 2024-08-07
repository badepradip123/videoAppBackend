import 'dotenv/config';
import connectDB from './db/index.js';
import { app } from './app.js';


connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERR:", error);
    });
    app.listen(process.env.PORT || 8000, () => {
        console.log("App is listening")
    });
})
.catch((err) => {
    console.log("error---",err)
})
/*
import express from 'express';
import { DB_NAME } from './constants';

const app = express();

( async() => {
    try {   
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.log("ERR:", error);
        });

        app.listen(process.env.PORT, ()=> {
            console.log(`App is listening on port ${process.env.PORT}`);    
        })

        
    } catch (error) {
        console.log("ERR:", error);
        throw error;
    }

})()
*/