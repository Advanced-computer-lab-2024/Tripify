import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';

// Importing routes
import activityRoutes from './routes/activity.route.js'; 
import itineraryRoutes from './routes/itinerary.route.js';
import historicalplacesRoutes from './routes/historicalplaces.route.js';
import touristRoutes from './routes/tourist.route.js';
import tourguideRoutes from './routes/tourGuide.route.js';
import sellerRoutes from './routes/seller.route.js';
import adminRoutes from './routes/admin.route.js';
import advertiserRoutes from './routes/advertiser.route.js';
import tourismGovernorRoutes from './routes/toursimGovernor.route.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parses incoming JSON requests
app.use(cors()); // Enables CORS for all routes

// Connect to the database and start the server
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => { 
            console.log(`Server started at http://localhost:${process.env.PORT || 5000}`);
        });
    })
    .catch(error => {
        console.error('Database connection failed. Server not started.', error);
        process.exit(1); // Exit process with failure
    });

// Define API routes
app.use('/api/activities', activityRoutes); 
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/historicalplace', historicalplacesRoutes);
app.use('/api/tourist', touristRoutes);
app.use('/api/tourguide', tourguideRoutes);
app.use('/api/tourismGovernor', tourismGovernorRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/advertiser', advertiserRoutes);

// Optional: Handle 404 errors
app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
});

// Optional: Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack
    res.status(500).json({ message: 'Internal Server Error' });
});
