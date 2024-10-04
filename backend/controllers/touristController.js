import Tourist from'../models/Tourist.js';

// Controller to get a tourist profile by ID
export const getTouristProfile = async (req, res) => {
    try {
        const tourist = await Tourist.findById(req.params.id);
        if (!tourist) {
            return res.status(404).json({ msg: 'Tourist not found' });
        }
        res.json(tourist);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Controller to update a tourist profile
export const updateTouristProfile = async (req, res) => {
    const { name, age, country, bio } = req.body;

    try {
        let tourist = await Tourist.findById(req.params.id);
        if (!tourist) {
            return res.status(404).json({ msg: 'Tourist not found' });
        }

        // Prevent changes to username and wallet
        tourist.name = name || tourist.name;
        tourist.age = age || tourist.age;
        tourist.country = country || tourist.country;
        tourist.bio = bio || tourist.bio;

        await tourist.save();
        res.json(tourist);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
