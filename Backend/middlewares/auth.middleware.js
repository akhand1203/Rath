const userModel = require('../Models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../Models/blacklistToken.model');
const captainModel = require('../Models/captain.model');

module.exports.authUser = async (req, res, next) => {
    // Rely exclusively on auth header to prevent cookie contamination across roles
    const token = req.headers.authorization?.split(' ')[1];
    
    if(!token){
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        // Check if blacklisted
        const isBlacklisted = await blacklistTokenModel.findOne({token: token});
        if(isBlacklisted){
            return res.status(401).json({message: 'Unauthorized'});
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'});
    }
}

module.exports.authCaptain = async (req, res, next) => {
    // Rely exclusively on auth header to prevent cookie contamination across roles
    const token = req.headers.authorization?.split(' ')[1];
        
    if(!token){
        return res.status(401).json({message: 'Unauthorized'});
    }

    const isBlacklisted = await blacklistTokenModel.findOne({token: token});
    if(isBlacklisted){
        return res.status(401).json({message: 'Unauthorized'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const captain = await captainModel.findById(decoded.id);
        
        if (!captain) {
            return res.status(401).json({message: 'Unauthorized'});
        }
        
        req.captain = captain;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized'});
    }
}   
