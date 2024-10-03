import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.user._id;    //req.user is coming from the protectRoute middleware which is protecting this route from unauthorized access

        const notifications = await Notification.find({to: userId})
        .populate({
            path: "from",   //This is the user who has sent the notification. We set this as the path because we want to populate the user who has sent the notification
            select: "username profileImg",  //We only want to select the username and profileImg of the user who has sent the notification
        })

        await Notification.updateMany({to: userId}, {read: true}); //This line will update all the notifications of the user to read: true
        
        res.status(200).json(notifications);

    } catch (error) {
        console.log("Error in getNotifications controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const deleteNotifications = async (req, res) => {
    try {
        const userId = req.user._id;

        await Notification.deleteMany({to: userId});

        res.status(200).json({message: "Notifications deleted successfully"});
    } catch (error) {
        console.log("Error in deleteNotifications controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

export const deleteNotification = async(req, res) => {
    
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;

        const notification = await Notification.findById(notificationId);
        if(!notification){
            return res.status(404).json({error: "Notification not found"});
        }

        if(notification.to.toString() !== userId.toString()){
            return res.status(401).json({error: "You are not authorized to delete this notification"});
        }

        await Notification.findByIdAndDelete(notificationId);
        res.status(200).json({message: "Notification deleted successfully"});
        
    } catch (error) {
        console.log("Error in deleteNotification controller: ", error);
        res.status(500).json({error: "Internal Server Error"});
        
    }
}