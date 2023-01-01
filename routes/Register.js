const bcrypt =require("bcrypt")
const joi=require("joi")
const express=require("express")
const {User}=require("../models/Users")
const genAuthToken = require("../utilities/genAuth")

const router=express.Router()
router.post("/",async(req,res)=>{
    const schema=joi.object({
        name:joi.string().required().min(3).max(30),
        email:joi.string().required().email().min(3).max(300),
        password:joi.string().required().min(6).max(1024)
    })
   const{error}= schema.validate(req.body);
   if(error)
   {
    return res.status(400).send(error.details[0].message)    
   }
 let user= await User.findOne({email:req.body.email})
     
  if(user)
   {
    return res.status(400).send("user already exists")    
   }
    user= new User({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password

    });
const salt=await bcrypt.genSalt(10)
user.password=await bcrypt.hash(user.password,salt)
user=await user.save()
const token=genAuthToken(user)
res.send(token)
})
module.exports=router;