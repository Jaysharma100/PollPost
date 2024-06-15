import jwt from 'jsonwebtoken';
import FormDataModel from '../models/usermodel.js';
import RefreshToken from '../models/RefreshToken.js';

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.Accesstoken);
        req.userId = decoded.userId;

        const user = await FormDataModel.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ message: 'Invalid token' });
    }
};

export default authMiddleware;
