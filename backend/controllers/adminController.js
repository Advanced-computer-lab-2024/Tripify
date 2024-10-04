import Tourist from '../models/Tourist.js'; 

// Controller to delete a tourist account by ID
export const deleteAccount = async (req, res) => {
    try {
        const userId = req.params.id;

        // Find and delete the tourist by ID
        const deletedUser = await Tourist.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ msg: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
