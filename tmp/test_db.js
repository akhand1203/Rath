const mongoose = require('mongoose');
const Ride = require('../Backend/Models/ride.model');
require('dotenv').config({ path: '../Backend/.env' });

async function run() {
  await mongoose.connect(process.env.DB_CONNECT);
  const rides = await Ride.find().sort({ createdAt: -1 }).limit(3);
  console.log('--- RECENT RIDES ---');
  rides.forEach(r => {
    console.log(`ID: ${r._id}, Status: ${r.status}, Captain: ${r.captainId ? r.captainId : 'None'}`);
  });
  console.log('--------------------');
  process.exit();
}
run().catch(console.error);
