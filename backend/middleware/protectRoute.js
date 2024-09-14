import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;
        
        if(!token){
            return res.status(401).json({error: "Unauthorized: No token provided"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({error: "Unauthorized: Invalid token"});
        }

        const user = await User.findById(decoded.userId).select("-password");   //We had passed the userId as a payload in the token while generating the token in the generateTokenAndSetCookie function. The select("-password") is used to not send the password back to the user

        if(!user){
            return res.status(404).json({error: "User not found"});
        }

        req.user = user;    //We are setting the user object in the request object so that we can access it in the next middleware function
        next(); //This is used to call the next middleware function. If we don't call this then the request will be stuck in this middleware function and won't move to the next middleware function
    }
    catch(error){
        //For debugging purposes we can console.log the error
        console.log("Error in protectRoute middleware: ", error.message);
        res.status(500).json({error: "Internal server error"});
    }
};