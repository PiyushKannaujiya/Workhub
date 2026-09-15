const express = require("express");
const User = require("../models/userModel");

const router = express.Router();

router.post("/users",async(req,res)=>{
    try{
        const user = await User.create({
      name: "Test User",
      email: "test@workhub.com",
      password: "test123",
    });

    res.status(201).json(user);
    }catch(error){
        res.status(500).json({
            message : error.message,
        });
    }

});

module.exports = router;

