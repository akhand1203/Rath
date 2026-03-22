const userModel = require('../Models/user.model');

module.exports.registerUser = async({
    firstname, lastname, email, password
}) =>{
    if(!firstname || !email || !password){
        throw new Error('All fields are required');
    }
    const user = await userModel.create({
        firstname,
        lastname,
        email,
        password,
    })
    return user;
}