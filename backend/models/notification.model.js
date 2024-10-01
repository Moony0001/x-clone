import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    from:{  // the user who is sending the notification
        type: mongoose.Schema.Types.ObjectId,   //This is used to refer to the User model
        ref: 'User',
        required: true  //This means that the from field is mandatory
    }, 
    to:{
        type: mongoose.Schema.Types.ObjectId,   //This is used to refer to the User model
        ref: 'User',
        required: true  //This means that the to field is mandatory
    },
    type:{
        type: String,
        required: true,
        enum: ['follow', 'like', 'comment', 'reply'],   //This is used to specify the possible values for the type field
    },
    read: {
        type: Boolean,
        default: false
    }

},
 {timestamps: true});

 const Notification = mongoose.model('Notification', notificationSchema);

 export default Notification;