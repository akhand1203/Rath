const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
        minlength: [3, 'First name must be at least 3 characters']  
    },
    lastname:{
        type: String,
        minlength: [3, 'Last name must be at least 3 characters']  
    },
    email:{
        type: String,
        required:true,
        unique: true,
        minlength: [5, 'Email must be at least 5 characters']
    },
    password:{
        type: String,
        required: true,
    },
    socketId:{
        type: String,
    }
})