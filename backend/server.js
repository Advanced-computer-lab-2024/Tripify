import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import activityRoutes from './routes/activity.route.js'; 
import userRoutes from './routes/user.route.js'; // Import the user routes

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

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
// Existing activity routes
app.use('/api/activities', activityRoutes); 

// Add the new user routes
app.use('/api/user', userRoutes);
