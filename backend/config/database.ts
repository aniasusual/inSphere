import mongoose, { ConnectOptions } from 'mongoose';

const connectDatabase = async (): Promise<void> => {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI as string);

        console.log("DATABASE CONNECTED: " + con.connection.host);
    } catch (err) {
        console.error("Database connection error: " + err);
        process.exit(1); // Exit the process if the database connection fails
    }
};

export default connectDatabase;