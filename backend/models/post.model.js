import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    //Each post is going to have an author, a user who created the post
    user: {
        type: mongoose.Schema.Types.ObjectId,   //This is going to be a user id
        ref: "User",    //This is going to reference the User model
        required: true, //This is going to be required
    },
    //Each post will have some text in it.
    text: {
        type: String,   //The text will be optional, the user can choose to add text or an image or both
    },
    img: {
        type: String,   //The image will be optional, the user can choose to add text or an image or both
    },
    likes: [    //The likes will be an array of user ids with references to the user model
        {
            type: mongoose.Schema.Types.ObjectId,   //This is going to be a user id
            ref: "User",    //This is going to reference the User model
        }
    ],
    comments: [ //The comments will be an array of comment objects
        {
            text: String,   //Each comment will have a text
            user: {
                type: mongoose.Schema.Types.ObjectId,   //This is going to be a user id
                ref: "User",    //This is going to reference the User model
                required: true, //This is going to be required
            }
        }
    ]
},{timestamps: true});

const Post = mongoose.model("Post", postSchema);    //We create the model with the first parameter as the name of the model and the second parameter as the schema

export default Post; //We export the model so that we can use it in other files