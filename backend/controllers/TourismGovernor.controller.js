import TourismGovernor from '../models/TourismGovernor.js';

// Controller to add a Tourism Governor
export const addTourismGovernor = async (req, res) => {

    try {
        const { username, password, email } = req.body;

        let existingUser = await TourismGovernor.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ msg: 'Username already exists' });
        }

        existingUser = await TourismGovernor.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'Email already exists' });
        }

        // Create new Tourism Governor
        const newGovernor = new TourismGovernor({ username, password, email });
        await newGovernor.save();

        res.status(201).json({ msg: 'Tourism Governor added successfully', governor: newGovernor });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
