import mongoose from "mongoose";

const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI); //Using this connection string we are able to connect to our mongoDB database
        console.log(`MongoDB connected: ${conn.connection.host}`);   //The conn variable above is going to give us some value and we can console log that value as well.
        
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        process.exit(1); //Means there were some errors.
    }
}

export default connectMongoDB;