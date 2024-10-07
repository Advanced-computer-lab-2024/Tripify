import HistoricalPlace from "../models/histroicalplace.model.js"; // Ensure the import path is correct

export const createHistoricalPlace = async (req, res) => {
    try {
        const historicalPlace = await HistoricalPlace.create(req.body);
        res.status(201).json(historicalPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getHistoricalPlaceById = async (req, res) => {
    try {
        const historicalPlace = await HistoricalPlace.findById(req.params.id)
            .populate('tags')       // Populate the tags field
            .populate('createdBy');  // Populate the creator field
        if (!historicalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }
        res.status(200).json(historicalPlace);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAllHistoricalPlaces = async (req, res) => {
    try {
        const historicalPlaces = await HistoricalPlace.find()
            .populate('tags')       // Populate the tags field for all historical places
            .populate('createdBy');  // Populate the creator field
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHistoricalPlace = async (req, res) => {
    try {
        const updatedHistoricalPlace = await HistoricalPlace.findByIdAndUpdate(
            req.params.id, req.body, {
                new: true,
                runValidators: true
            }
        ).populate('tags')        // Populate after updating
         .populate('createdBy');   // Populate after updating
         
        if (!updatedHistoricalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }
        res.status(200).json(updatedHistoricalPlace);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteHistoricalPlace = async (req, res) => {
    try {
        console.log(`Deleting historical place with ID: ${req.params.id}`);
        const historicalPlace = await HistoricalPlace.findById(req.params.id);
        if (!historicalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }
        await HistoricalPlace.deleteOne({ _id: req.params.id }); // Alternative method
        res.status(200).json({ message: 'Historical place deleted successfully' });
    } catch (error) {
        console.error('Error in deleteHistoricalPlace:', error);
        res.status(500).json({ message: error.message });
    }
};

