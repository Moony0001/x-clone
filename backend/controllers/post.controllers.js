import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import {v2 as cloudinary} from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString(); //req.user is coming from the protectRoute middleware which is protecting this route from unauthorized access

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error: "User not found"});
        }
        if(!text && !img){
            return res.status(400).json({error: "Post must have a text or an image"});
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newPost = new Post({
            user: userId,
            text,
            img,
        })
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({error: "Internal Server Error"});
        console.log("Error in createPost controller: ", error);
    }
}

export const deletePost = async (req,res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){return res.status(404).json({error: "Post not found"})}
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({error: "You are not authorized to delete this post"});
        }

        if(post.img){
            const imgId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(req.params.id);
        
        res.status(200).json({message: "Post deleted successfully"});
    } catch (error) {
        console.log("Error in deletePost controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const {text} = req.body;
        const userId = req.user._id;
        if(!text){
            return res.status(400).json({error: "Comment must have text"});
        }
        const post = await Post.findById(req.params.id);
        if(!post){return res.status(404).json({error: "Post not found"});}
        
        const newComment = {
            user: userId,
            text,
        }
        post.comments.push(newComment);
        await post.save();

        const notification = new Notification({
            from: userId,
            to: post.user,
            type: "comment",
        })

        await notification.save();
        res.status(200).json(post);
        
    } catch (error) {
        console.log("Error in commentOnPost controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if(!post){
            return res.status(404).json({error: "Post not found"});
        }
        
        const isLiked = post.likes.includes(userId);

        if(isLiked){
            //Unlikes post
            await Post.updateOne({_id: postId}, {$pull: {likes: userId}});  //***If you had an object instance of Post, that would represent a specific post that you had already fetched from the database. However, when using updateOne(), you are performing a direct update on the database without having to first fetch the document into memory. This is more efficient in cases where you just need to modify a document and don't need to interact with the post data in the application.
            await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}});     //This line is removing the post from the likedPosts array of the user who unliked the post 
            res.status(200).json({message: "Post unliked successfully"});
        }else{
            //Likes post 
            post.likes.push(userId);    //We can use the updateOne method here as well but we are using the save method here to show you that you can use both methods
            await User.updateOne({_id:userId}, {$push: {likedPosts: postId}});    //This line is adding the post to the likedPosts array of the user who liked the post
            await post.save();

            const notification = new Notification ({
                from: userId,
                to: post.user,
                type: "like",
            })

            await notification.save();

            res.status(200).json({message: "Post liked successfully"});
        }
    } catch (error) {
        console.log("Error in likeUnlikePost controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
        
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const post = await Post.find().sort({createdAt: -1}).populate({
            path: "user",
            select: "-password",
        }).populate({
            path: "comments.user",
            select: "-password",
        })
        if(post.length === 0){
            return res.status(200).json([]);    //If there are no posts in the database, we return an empty array with a 200 status
        }

        res.status(200).json(post);
    } catch (error) {
        console.log("Error in getAllPosts controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getLikedPosts = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user){return res.status(404).json({error: "User not found"});}

        const likedPosts = await Post.find({_id: {$in: user.likedPosts}})   //This line is finding all the posts whose ids are in the likedPosts array of the user, it takes all the posts and matches their ids with the ids in the likedPosts array of the user
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        })

        res.status(200).json(likedPosts);
    } catch (error) {
        console.log("Error in getLikedPosts controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if(!user){return res.status(404).json({error: "User not found"});}

        const following = user.following;
        const feedPosts = await Post.find({user: {$in: following}}).sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        })

        res.status(200).json(feedPosts);
    } catch (error) {
        console.log("Error in getFollowingPosts controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({username});
        if(!user){return res.status(404).json({error: "User not found"});}

        const posts = await Post.find({user: user._id}).sort({createdAt: -1})
        .populate({
            path: "user",
            select: "-password",
        })
        .populate({
            path: "comments.user",
            select: "-password",
        });

        res.status(200).json(posts);
    } catch (error) {
        console.log("Error in getUserPosts controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}