import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

//models
import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";


export const getUserProfile = async (req, res) => {
    const { username } = req.params;

    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json(user);
    }catch (error) {
        console.log("Error in getUserProfile controller: ", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const followUnfollowUser = async (req, res) => {
    try {
        const { id } = req.params;  //The id of the user to follow/unfollow
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if(id === req.user._id.toString()){ //We need to convert the req.user._id to a string as it is an object
            return res.status(400).json({ error: "You cannot follow/unfollow yourself" });
        }

        if(!userToModify || !currentUser){
            return res.status(404).json({ error: "User not found" });
        }

        const isFollowing = currentUser.following.includes(id);
        
        if(isFollowing){
            //Unfollow the user
            await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id}}); //Remove the current user from the followers list of the user to unfollow
            await User.findByIdAndUpdate(req.user._id, { $pull: { following: id}}); //Remove the user to unfollow from the following list of the current user
            //We don't want to send a notification to the user on being unfollowed
            //TODO return the id of the user as a response
            res.status(200).json({ message: "User unfollowed successfully" });

        }else{
            //Follow the user
            await User.findByIdAndUpdate(id, { $push: { followers: req.user._id}}); //Add the current user to the followers list of the user to follow
            await User.findByIdAndUpdate(req.user._id, { $push: { following: id}}); //Add the user to follow to the following list of the current user
            //Send notification to the user
            const newNotification = new Notification({
                type: "follow",
                from: req.user._id,
                to: userToModify._id
            })
            await newNotification.save();   //Save the notification to the database. We store it in the database so that we can show the notifications to the user when they login
            //TODO return the id of the user as a response
            res.status(200).json({ message: "User followed successfully" });
        }
    } catch (error) {
        console.log("Error in followUnfollowUser controller: ", error.message);
        res.status(500).json({ error: error.message });
    }
 }

export const getSuggestedUsers = async (req, res) => {
    try {
        const userId = req.user._id;

        const usersFollowedByMe = await User.findById(userId).select("following");  //Get the list of users followed by the current user

        const users = await User.aggregate([
            {
                $match:{
                    _id: {$ne:userId}   //Get all users except the current user
                }
            },
            {$sample: {size: 10}} //Get 10 random users
        ])

        const filteredUsers = users.filter(user=>!usersFollowedByMe.following.includes(user._id.toString())); //Filter out the users that are already followed by the current user.The filter() function is iterating over the users array and checking, for each user, if their _id (converted to a string) is not present in the following array. !usersFollowedByMe.following.includes(user._id.toString()): This part checks if the current user._id is not included in the following array. If the user is not followed, they will be included in the filteredUsers array.
        const suggestedUsers = filteredUsers.slice(0, 4);   //Get the first 4 users from the filteredUsers array

        suggestedUsers.forEach(user => {user.password = undefined;});   //Remove the password from the user object. This takes effect only in the response and it doesn't affect the database


        res.status(200).json(suggestedUsers);
    } catch (error) {
        console.log("Error in suggestedUsers: ", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const updateUser = async (req, res) => {
    const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body; 
    let {profileImg, coverImg} = req.body;  //We need to declare profileImg and coverImg as let because we will modify them later
    const userId = req.user._id;    //Get the id of the current user

    try {
        let user = await User.findById(userId); //Check if the user exists in the database and get the user from the database, we need to use let because we are modifying its fields later on and we cannot assign anything to a constant variable.
        if(!user){
            return res.status(404).json({ error: "User not found" });
        }
        //If the user passes the currentPassword, and not the newPassword, or vice-versa, we will return an error
        if(!newPassword && currentPassword || newPassword && !currentPassword){
            return res.status(400).json({error: "Please provide both the current password and new password"});
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword,user.password); //Compare the current password with the password in the database
            if(!isMatch){
                return res.status(400).json({error: "Current password is incorrect" })
            }
            if(newPassword.length < 6){
                return res.status(400).json({error: "Password must be at least 6 characters long" });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt); //Hash the new password and save it to the user object
        }

        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); //Delete the previous profile image from Cloudinary. We are using the public_id of the image to delete it. We are splitting the profileImg URL by "/" and getting the last element of the array by using the pop(), which is the public_id of the image. We are then splitting the public_id by "." and getting the first element of the array, which is the public_id without the file extension. This is the format that Cloudinary uses to store the images. We are using this format to delete the image from Cloudinary
            }

            const uploadedResponse = await cloudinary.uploader.upload(profileImg);  //Upload the profile image to Cloudinary
            profileImg = uploadedResponse.secure_url;   //Get the secure_url from the response and save it to the profileImg variable, secure_url is a field of the response object that contains the URL of the uploaded image
        }

        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]); //Delete the previous profile image from Cloudinary. We are using the public_id of the image to delete it. We are splitting the profileImg URL by "/" and getting the last element of the array by using the pop(), which is the public_id of the image. We are then splitting the public_id by "." and getting the first element of the array, which is the public_id without the file extension. This is the format that Cloudinary uses to store the images. We are using this format to delete the image from Cloudinary
            }

            const uploadedResponse = await cloudinary.uploader.upload(coverImg);  //Upload the cover image to Cloudinary
            coverImg = uploadedResponse.secure_url;   //Get the secure_url from the response and save it to the coverImg variable
        }

        user.fullName = fullName || user.fullName; //If the fullName is provided, update the fullName of the user, otherwise, keep the current fullName
        user.email = email || user.email;   //If the email is provided, update the email of the user, otherwise, keep the current email
        user.username = username || user.username; //If the username is provided, update the username of the user, otherwise, keep the current username
        user.bio = bio || user.bio; //If the bio is provided, update the bio of the user, otherwise, keep the current bio
        user.link = link || user.link; //If the link is provided, update the link of the user, otherwise, keep the current link
        user.profileImg = profileImg || user.profileImg; //If the profileImg is provided, update the profileImg of the user, otherwise, keep the current profileImg
        user.coverImg = coverImg || user.coverImg; //If the coverImg is provided, update the coverImg of the user, otherwise, keep the current coverImg

        user = await user.save();   //Save the updated user to the database

        user.password = undefined;  //Remove the password from the user object. This takes effect only in the response and it doesn't affect the database as long as we don't add user.save() after this line. If we do, the password will be removed from the database as well

        res.status(200).json(user);
    } catch (error) {
        console.log("Error in updateUser controller: ", error.message);
        res.status(500).json({ error: error.message });        
    }
}