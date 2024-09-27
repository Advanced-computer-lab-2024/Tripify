import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import activityRoutes from './routes/activity.route.js'; 

dotenv.config();

const app = express();


app.use(express.json());

connectDB().then(() => {
    app.listen(process.env.PORT || 5000, () => { 
        console.log(`Server started at http://localhost:${process.env.PORT || 5000}`);
    });
}).catch(error => {
    console.error('Database connection failed. Server not started.', error);
    process.exit(1);
});


app.use('/api/activities', activityRoutes); 
