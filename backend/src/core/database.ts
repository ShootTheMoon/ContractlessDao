import mongoose from 'mongoose';
const {DATABASE_PASSWORD, DATABASE_SERVER, DATABASE_USERNAME, DATABASE} = process.env;

// Initialize database
mongoose.connect(`mongodb+srv://${DATABASE_USERNAME}:${DATABASE_PASSWORD}@${DATABASE_SERVER}/${DATABASE}`);