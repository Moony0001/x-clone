import { generateTokenAndSetCookie } from '../lib/utils/generateToken.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'

export const signup = async (req,res)=>{
    try {
        const {fullName, username, email, password} = req.body;
       

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^/s@]+$/;    //This is something that we can find online. This is an email regular expression and this is just going to check if the email that the user passed is valid or not
        if(!emailRegex.test(email)){
            return res.status(400).json({error: "Invalid email format"});   //This checks if the email that the user passed is valid or not and if it is not it throws this 400 error with the message invalid email format.
        }

        const existingUser = await User.findOne({username});    //It actually looks like {username: username} this but since both have the same value we can shorten it like that
        if(existingUser){
            return res.status(400).json({ error: "Username is already taken"});
        }

        const existingEmail = await User.findOne({email});
        if(existingEmail){
            return res.status(400).json({error: "Email already taken"});
        }


        if(password.length < 6){
            return res.status(400).json({error: "Password must be atleast 6 characters long"});
        }
        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        //Now we create a new user object
        const newUser = new User({
            fullName,
            username,
            email,
            password: hashedPassword, 
        })

        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id : newUser._id,
                fullName: newUser.fullName,
                username: newUser.username,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
            })  //Notice how we are not sending the password back to the user
        }else{
            res.status(400).json({error: "Invalid user data"}); //This will be triggered when the newUser object is not created because of some invalid data
        }
    } catch (error) { 
        //For debugging purposes we can console.log the error
        console.log("Error in signup controller: ", error.message); 
        res.status(500).json({error: "Internal server error"});
    }
}

export const login = async (req,res)=>{
    try {
        const {username, password} = req.body;
        const user = await User.findOne({username});    //It actually looks like {username: username} this but since both have the same value we can shorten it like that. It looks for the user with the username that the user passed in the request body.
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");    //This is going to check if the user exists and if the password that the user passed is correct or not. An alternate way to write this is user && (await bcrypt.compare(password, user.password));
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: "Invalid username or password"});
        }

        generateTokenAndSetCookie(user._id, res);   //This function is going to generate a token and set it in the cookie if the user exists and the password is correct
        
        res.status(200).json({
            _id : user._id,
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            followers: user.followers,
            following: user.following,
            profileImg: user.profileImg,
            coverImg: user.coverImg,
        })  //Notice how we are not sending the password back to the user

    } catch (error) {
        //For debugging purposes we can console.log the error
        console.log("Error in login controller: ", error.message); 
        res.status(500).json({error: "Internal server error"});
    }
}

export const logout = async (req,res)=>{
    try {
        res.cookie("jwt", "", {maxAge: 0});  //This is how we delete the cookie. We set the maxAge to 0 so that the cookie is deleted immediately
        res.status(200).json({message: "Logged out successfully"});   //We send a message to the user that they have been logged out
    } catch (error) {
        //For debugging purposes we can console.log the error
        console.log("Error in logout controller: ", error.message); 
        res.status(500).json({error: "Internal server error"});
        
    }
}

export const getMe = async (req,res)=>{
    try {
        const user = await User.findById(req.user._id).select("-password");    //We are finding the user by the id that is stored in the req.user object. We are selecting all the fields except the password field because we are going to send this to the client and we don't want to send the password to the client
        res.status(200).json(user); //We are sending the user object to the client
    }catch (error) {
        //For debugging purposes we can console.log the error
        console.log("Error in getMe controller: ", error.message); 
        res.status(500).json({error: "Internal server error"});
    }
}