import Activity from '../models/activity.model.js';


export const createActivity = async (req, res) => {
    try {
        const activity = new Activity(req.body);
        await activity.save();
        res.status(201).json(activity); 
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
};

// Get all activities(with a filter and sort if applied)
export const getActivities = async (req, res) => {
    try {
        const { minBudget, maxBudget, minRating, maxRating, startDate, endDate, category, sortBy } = req.query;
        let query = {};

        //filters
        if (category) query.category = category;
        if (minBudget || maxBudget) {
            query.budget = {};
            if (minBudget) query.budget.$gte = Number(minBudget);
            if (maxBudget) query.budget.$lte = Number(maxBudget);
        }
        if (minRating || maxRating) {
            query.rating = {};
            if (minRating) query.rating.$gte = Number(minRating);
            if (maxRating) query.rating.$lte = Number(maxRating);
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Apply sorting based on query params (price or rating)
        let sortOptions = {};
        if (sortBy === 'price') {
            sortOptions.price = 1; 
        } else if (sortBy === 'rating') {
            sortOptions.rating = 1;
        }

        // Fetch activities based on query and sorting
        const activities = await Activity.find(query).sort(sortOptions);
        if (activities.length === 0) {
            return res.status(404).json({ message: 'No activities found' });
        }
        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const getActivityById = async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' }); 
        }
        res.status(200).json(activity); 
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};

export const updateActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' }); 
        }
        res.status(200).json(activity); 
    } catch (error) {
        res.status(400).json({ message: error.message }); 
    }
};

export const deleteActivity = async (req, res) => {
    try {
        const activity = await Activity.findByIdAndDelete(req.params.id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' }); 
        }
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ message: error.message }); 
    }
};



