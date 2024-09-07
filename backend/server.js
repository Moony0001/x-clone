import express from "express";
import dotenv from "dotenv"

import authRoutes from "./routes/auth.routes.js" //Always remember to add the file extension after the name of the file as we are using the "type" of module
import connectMongoDB from "./db/connectMongoDB.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use("/api/auth",authRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is up and running on port ${PORT}`);
    connectMongoDB();
})