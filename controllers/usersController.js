const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel.js');

const login = asyncHandler( async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email})
    if (user && (await bcryptjs.compare(password, user.password))) {
        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generarToken(user.id)
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

const register = asyncHandler( async (req, res) => {
    const {name, email, password} = req.body
    if(!name || !email || !password){
        res.status(400)
        throw new Error('Please provide name, email and password')
    }
    const existingUser = await User.findOne({email})
    if(existingUser){
        res.status(400)
        throw new Error('User already exists')
    }    
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)
    const user = await User.create({
        name,
        email,
        password:  hashedPassword
    })
    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }    
})
const data = asyncHandler( async (req, res) => {
    res.status(200).json(req.user)
})
const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}
module.exports = {
    login,
    register,
    data
}