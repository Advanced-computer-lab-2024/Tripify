import HistoricalPlace from "../models/histroicalplace.model.js"; // Ensure the import path is correct

// Create a new historical place
export const createHistoricalPlace = async (req, res) => {
    try {
        const { tags } = req.body;
        if (tags && !Array.isArray(tags)) {
            return res.status(400).json({ message: "Tags must be an array of valid IDs" });
        }

        const historicalPlace = await HistoricalPlace.create(req.body);
        res.status(201).json(historicalPlace);
    } catch (error) {
        console.error("Error creating historical place:", error);
        res.status(400).json({ message: error.message });
    }
};

// Get historical places filtered by tags
export const getHistoricalPlacesByTags = async (req, res) => {
    const { tags } = req.query; // Get tags from query parameters

    // Log incoming tags to ensure they are coming correctly
    console.log("Received tags:", tags);

    try {
        const filter = tags ? { tags: { $in: tags.split(',') } } : {}; // Split and filter by tags

        console.log("MongoDB Filter:", filter); // Log the filter query for debugging

        const historicalPlaces = await HistoricalPlace.find(filter)
            .populate('tags')       // Populate the tags field
            .populate('createdBy');  // Populate the creator field

        if (historicalPlaces.length === 0) {
            return res.status(404).json({ message: 'No historical places found for the selected tags.' });
        }

        res.status(200).json(historicalPlaces);
    } catch (error) {
        // Log the error to debug the exact issue
        console.error("Error filtering historical places by tags:", error);
        res.status(500).json({ message: error.message });
    }
};


// Get a specific historical place by ID
export const getHistoricalPlaceById = async (req, res) => {
    try {
        const historicalPlace = await HistoricalPlace.findById(req.params.id)
            .populate('tags')
            .populate('createdBy')
            .lean();

        if (!historicalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }

        res.status(200).json(historicalPlace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get all historical places
export const getAllHistoricalPlaces = async (req, res) => {
    try {
        const historicalPlaces = await HistoricalPlace.find()
            .populate('tags')
            .populate('createdBy')
            .lean(); // Use lean for better performance

        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update an existing historical place by ID
export const updateHistoricalPlace = async (req, res) => {
    try {
        const updatedHistoricalPlace = await HistoricalPlace.findByIdAndUpdate(
            req.params.id, req.body, { new: true, runValidators: true }
        )
        .populate('tags')
        .populate('createdBy')
        .lean(); // Use lean for better performance

        if (!updatedHistoricalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }

        res.status(200).json(updatedHistoricalPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a historical place by ID
export const deleteHistoricalPlace = async (req, res) => {
    try {
        console.log(`Deleting historical place with ID: ${req.params.id}`);
        const historicalPlace = await HistoricalPlace.findById(req.params.id);

        if (!historicalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }

        await HistoricalPlace.findByIdAndDelete(req.params.id); // Cleaner delete
        res.status(200).json({ message: 'Historical place deleted successfully' });
    } catch (error) {
        console.error('Error in deleteHistoricalPlace:', error);
        res.status(500).json({ message: error.message });
    }
};
