import HistoricalPlace from "../models/histroicalplace.model.js";


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
        const historicalPlace = await HistoricalPlace.findById(req.params.id);
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
        const historicalPlaces = await HistoricalPlace.find();
        res.status(200).json(historicalPlaces);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateHistoricalPlace = async (req, res) => {
    try {
        const updatedHistoricalPlace = await HistoricalPlace.findByIdAndUpdate
        (req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!updatedHistoricalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }
        res.status(200).json(updatedHistoricalPlace);
    }   catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const deleteHistoricalPlace = async (req, res) => {
    try {
        const historicalPlace = await HistoricalPlace.findById(req.params.id);
        if (!historicalPlace) {
            return res.status(404).json({ message: 'Historical place not found' });
        }
        await historicalPlace.remove();
        res.status(200).json({ message: 'Historical place deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
