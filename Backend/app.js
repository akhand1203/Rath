const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const connectTodb = require('./db/db');
const userRoutes = require('./routes/user.routes');
const captainRoutes = require('./routes/captain.routes');
const rideRoutes = require('./routes/ride.routes');
const mapRoutes = require('./routes/map.routes');

// Verify environment variables
console.log('🔐 ENVIRONMENT CHECK:');
console.log('   JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('   JWT_SECRET length:', process.env.JWT_SECRET?.length || 0);
console.log('   MONGO_URI exists:', !!process.env.MONGO_URI);
console.log('   PORT:', process.env.PORT || 4000);

connectTodb();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());




app.get('/',(req,res)=>{
    res.send("hello world");
});

app.use('/users', userRoutes);
app.use('/captains', captainRoutes);
app.use('/rides', rideRoutes);
app.use('/maps', mapRoutes);

module.exports=app;