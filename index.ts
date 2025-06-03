import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose.connect(process.env.MONGO_DB_URI!).then((e) => {
  console.log("connected to db: " + e.version);
}).catch((e)=>{
    console.log("coonection failed to DB");
})

const app = express();

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("server is running:",PORT);
});
