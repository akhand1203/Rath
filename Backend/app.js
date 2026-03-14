const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const app = express();
const connectTodb = require('./db/db');

connectTodb();

app.use(cors());




app.get('/',(req,res)=>{
    res.send("hello world");
});

module.exports=app;