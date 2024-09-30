import bcrypt from 'bcrypt';
import Guest from '../models/guest.model.js';

export const registerGuest = async (req, res) => {
    const { email, username, password, mobileNumber, nationality, dob, jobOrStudent } = req.body;

    // Check if the user is under 18
    if (Guest.isUnder18(dob)) {
        return res.status(400).json({ message: "You must be 18 years or older to register." });
    }

    try {
        // Check if email already exists
        const existingEmail = await Guest.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Check if username already exists
        const existingUsername = await Guest.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new guest
        const newGuest = new Guest({
            email,
            username,
            password: hashedPassword,
            mobileNumber,
            nationality,
            dob,
            jobOrStudent,
        });

        // Save the guest
        await newGuest.save();
        res.status(201).json({ message: "Registration successful." });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
};

export const registerUser = async (req, res) => {
    const { email, username, password, role } = req.body;

    // Validate role
    const validRoles = ['tour_guide', 'advertiser', 'seller'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role specified." });
    }

    try {
        // Check if email already exists
        const existingEmail = await Guest.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // Check if username already exists
        const existingUsername = await Guest.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new guest with the specified role
        const newGuest = new Guest({
            email,
            username,
            password: hashedPassword,
            role,
        });

        // Save the guest
        await newGuest.save();
        res.status(201).json({ message: `Registration as a ${role} successful.` });
    } catch (error) {
        res.status(500).json({ message: "Server error.", error });
    }
};
