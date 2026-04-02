const socketio = require('socket.io');
const userModel = require('./Models/user.model');
const captainModel = require('./Models/captain.model');

let io;
const userSocketMap = {};
const captainSocketMap = {};
const captainLocations = {};

const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const radius = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return radius * c;
};

const removeSocketMappings = async (socketId) => {
    for (const [userId, mappedSocketId] of Object.entries(userSocketMap)) {
        if (mappedSocketId === socketId) {
            delete userSocketMap[userId];
            await userModel.findByIdAndUpdate(userId, { socketId: null });
            console.log(`🧹 Removed user socket mapping: ${userId}`);
        }
    }

    for (const [captainId, mappedSocketId] of Object.entries(captainSocketMap)) {
        if (mappedSocketId === socketId) {
            delete captainSocketMap[captainId];
            await captainModel.findByIdAndUpdate(captainId, { socketId: null });
            console.log(`🧹 Removed captain socket mapping: ${captainId}`);
        }
    }

    for (const [captainId, location] of Object.entries(captainLocations)) {
        if (location.socketId === socketId) {
            delete captainLocations[captainId];
            console.log(`🚗 Captain ${captainId} location removed`);
        }
    }
};

const registerUserSocket = async (socket, userId) => {
    const normalizedUserId = String(userId);
    userSocketMap[normalizedUserId] = socket.id;
    socket.data.userId = normalizedUserId;
    socket.data.userType = 'user';
    socket.join(normalizedUserId);
    console.log('User connected:', normalizedUserId, socket.id);

    const updatedUser = await userModel.findByIdAndUpdate(
        normalizedUserId,
        { socketId: socket.id },
        { new: true }
    );

    if (!updatedUser) {
        console.error('❌ User not found in database:', normalizedUserId);
    }
};

const registerCaptainSocket = async (socket, captainId, location = null) => {
    const normalizedCaptainId = String(captainId);
    captainSocketMap[normalizedCaptainId] = socket.id;
    socket.data.userId = normalizedCaptainId;
    socket.data.userType = 'captain';
    socket.join(normalizedCaptainId);
    console.log('Captain connected:', normalizedCaptainId, socket.id);

    const updatedCaptain = await captainModel.findByIdAndUpdate(
        normalizedCaptainId,
        { socketId: socket.id },
        { new: true }
    );

    if (!updatedCaptain) {
        console.error('❌ Captain not found in database:', normalizedCaptainId);
    }

    if (location && location.lat && location.lng) {
        captainLocations[normalizedCaptainId] = {
            lat: location.lat,
            lng: location.lng,
            socketId: socket.id
        };
    }
};

const initializeSocket = (server) => {
    io = socketio(server, {
        cors: {
            origin: 'http://localhost:5173',
            credentials: true,
            methods: ['GET', 'POST']
        },
        transports: ['websocket', 'polling'],
        pingInterval: 25000,
        pingTimeout: 60000,
        upgrade: true
    });

    io.on('connection', (socket) => {
        console.log('🔌 Socket connected:', socket.id);

        socket.on('register-user', async (userId) => {
            try {
                if (!userId) {
                    console.error('❌ register-user missing userId');
                    return;
                }

                await registerUserSocket(socket, userId);
            } catch (error) {
                console.error('❌ Error in register-user:', error.message);
            }
        });

        socket.on('register-captain', async (captainId) => {
            try {
                if (!captainId) {
                    console.error('❌ register-captain missing captainId');
                    return;
                }

                await registerCaptainSocket(socket, captainId);
            } catch (error) {
                console.error('❌ Error in register-captain:', error.message);
            }
        });

        socket.on('join', async (data = {}) => {
            const { userId, userType, location } = data;

            try {
                if (userType === 'user') {
                    await registerUserSocket(socket, userId);
                    return;
                }

                if (userType === 'captain') {
                    await registerCaptainSocket(socket, userId, location);
                    return;
                }

                console.error('❌ join event missing valid userType:', data);
            } catch (error) {
                console.error('❌ Error in join event:', error.message);
            }
        });

        socket.on('update-captain-location', (data = {}) => {
            const { captainId, location } = data;

            if (!captainId || !location || location.lat == null || location.lng == null) {
                return;
            }

            captainLocations[String(captainId)] = {
                lat: location.lat,
                lng: location.lng,
                socketId: socket.id
            };

            console.log(`📍 Captain ${captainId} location updated:`, location);
        });

        socket.on('disconnect', async () => {
            console.log(`❌ Socket disconnected: ${socket.id}`);
            await removeSocketMappings(socket.id);
        });

        socket.on('error', (error) => {
            console.error('⚠️ Socket error:', error);
        });
    });

    return io;
};

const sendMessagetosocketid = (socketId, eventName, data) => {
    if (!io || !socketId) {
        return false;
    }

    try {
        console.log(`📤 Emitting ${eventName} to:`, socketId);
        io.to(socketId).emit(eventName, data);
        return true;
    } catch (error) {
        console.error(`❌ Error sending to socket: ${error.message}`);
        return false;
    }
};

const getUserSocketId = (userId) => userSocketMap[String(userId)] || null;
const getCaptainSocketId = (captainId) => captainSocketMap[String(captainId)] || null;

const sendMessageToRoom = (roomId, eventName, data) => {
    if (!io) {
        return false;
    }

    try {
        io.to(String(roomId)).emit(eventName, data);
        return true;
    } catch (error) {
        console.error(`❌ Error sending to room: ${error.message}`);
        return false;
    }
};

const broadcastMessage = (eventName, data) => {
    if (!io) {
        return false;
    }

    try {
        io.emit(eventName, data);
        console.log(`📢 Broadcast sent: ${eventName}`);
        return true;
    } catch (error) {
        console.error(`❌ Error broadcasting message: ${error.message}`);
        return false;
    }
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

const broadcastRideToNearbyCaptains = (rideData, radiusKm = 2) => {
    if (!io) {
        return [];
    }

    const nearestCaptains = [];
    const pickupLat = rideData.pickup.lat;
    const pickupLng = rideData.pickup.lng;

    try {
        if (Object.keys(captainLocations).length === 0) {
            console.warn('⚠️ NO CAPTAINS CONNECTED');
            return [];
        }

        for (const [captainId, location] of Object.entries(captainLocations)) {
            const distance = calculateDistance(pickupLat, pickupLng, location.lat, location.lng);

            if (distance <= radiusKm) {
                nearestCaptains.push({
                    captainId,
                    distance,
                    socketId: location.socketId
                });

                io.to(location.socketId).emit('new-ride', rideData);
            }
        }

        return nearestCaptains;
    } catch (error) {
        console.error(`❌ Broadcast error: ${error.message}`);
        return [];
    }
};

module.exports = {
    initializeSocket,
    getIO,
    sendMessagetosocketid,
    getUserSocketId,
    getCaptainSocketId,
    sendMessageToRoom,
    broadcastMessage,
    broadcastRideToNearbyCaptains,
    captainLocations,
    userSocketMap,
    captainSocketMap,
    get io() {
        return io;
    }
};
