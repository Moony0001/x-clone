import mongoose from "mongoose";

//The second object in the below function call is for timestamps. It is optional but it is useful for when we want to add the createdAt updatedAt field for the user so that we can show fields like Member Since:  
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullName:{
        type: String,
        required: true,
    },
    password:{
        type: String,
        required: true,
        minLength: 6, 
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    followers: [    //Followers will bea type of array as a person can have multiple followers
        {
            type: mongoose.Schema.Types.ObjectId,   //We are keeping each follower as a user id. This line basically means the follower will need to have this kind of mongodb object id type. MongoDB has object ids and all of them have some strict length so, lets say all of them have 16 characters and if you try to add an id like 123 it is going to give you some errors.
            ref: "User",    //This line says that it is going to reference the User model that means that the follower will be a UserID
            default: []     //By default when a user signs up this will be an empty array as the user will have zero followers
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: []
        }
    ],
    profileImg:{
        type: String,       
        default: "",        //This could be optional so we keep the default as empty string
    },
    coverImg: {
        type: String,
        default: "",        //This could be optional so we keep the default as empty string
    },
    bio: {
        type: String,
        default: "",        //This could be optional so we keep the default as empty string
    },
    link:{
        type: String,
        default: "",        //This could be optional so we keep the default as empty string
    },
    likedPosts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: [],
        }
    ]
},{timestamps: true})

//Till this line the schema has been created now we create the model

const User = mongoose.model("User", userSchema);
//Even though we call it as "User" in the database it is going to look like "Users" and this is done by mongoose behind the scenes

export default User;