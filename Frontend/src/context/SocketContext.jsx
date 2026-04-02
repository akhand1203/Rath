import React, { createContext, useEffect, useState, useCallback } from 'react'
import { getSocket } from './socket'

export const SocketDataContext = createContext()

const SocketContext = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false)
    const socket = getSocket()

    useEffect(() => {
        const handleConnect = () => {
            console.log('✅ Frontend socket connected:', socket.id)
            setIsConnected(true)
        }

        const handleDisconnect = () => {
            console.log('❌ Frontend socket disconnected')
            setIsConnected(false)
        }

        const handleConnectError = (error) => {
            console.error('⚠️ Connection error:', error?.message || error)
        }

        if (socket.connected) {
            setIsConnected(true)
        }

        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)
        socket.on('connect_error', handleConnectError)

        return () => {
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
            socket.off('connect_error', handleConnectError)
        }
    }, [socket])

    const sendMessage = useCallback((eventName, data) => {
        if (socket?.connected) {
            console.log(`📤 Emitting ${eventName} ->`, data)
            socket.emit(eventName, data)
        }
    }, [socket])

    const registerUser = useCallback((userId) => {
        if (socket?.connected && userId) {
            console.log('👤 Joining user room:', { userId, socketId: socket.id })
            socket.emit('join', { userId, userType: 'user' })
        }
    }, [socket])

    const registerCaptain = useCallback((captainId, location = null) => {
        if (socket?.connected && captainId) {
            console.log('🚗 Joining captain room:', { captainId, socketId: socket.id, location })
            socket.emit('join', { userId: captainId, userType: 'captain', location })
        }
    }, [socket])

    const receiveMessage = useCallback((eventName, callback) => {
        if (socket) {
            socket.on(eventName, callback)

            return () => {
                socket.off(eventName, callback)
            }
        }

        return () => {}
    }, [socket])

    const joinRoom = useCallback((userId, userType, location) => {
        if (userType === 'user') {
            registerUser(userId)
            return
        }

        if (userType === 'captain') {
            registerCaptain(userId, location)
            return
        }

        sendMessage('join', { userId, userType, location })
    }, [registerUser, registerCaptain, sendMessage])

    const removeListener = useCallback((eventName) => {
        if (socket) {
            socket.off(eventName)
        }
    }, [socket])

    const value = {
        socket,
        isConnected,
        sendMessage,
        registerUser,
        registerCaptain,
        receiveMessage,
        joinRoom,
        removeListener,
    }

    return (
        <SocketDataContext.Provider value={value}>
            {children}
        </SocketDataContext.Provider>
    )
}

export default SocketContext
