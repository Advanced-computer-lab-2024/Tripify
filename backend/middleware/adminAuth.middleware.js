// middleware/adminAuth.middleware.js
export const adminAuthMiddleware = (req, res, next) => {
    // Check if user has admin role
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin rights required." });
    }
    next();
};