const bcrypt =require("bcrypt")
const joi=require("joi")
const express=require("express")
const {User}=require("../models/Users")
const genAuthToken = require("../utilities/genAuth")

const router=express.Router()
router.post("/",async(req,res)=>{
    const schema=joi.object({
        email:joi.string().required().email().min(3).max(300),
        password:joi.string().required().min(6).max(1024)
    })
   const{error}= schema.validate(req.body)
   if(error)
   {
    return res.status(400).send(error.details[0].message)    
   }
 let user= await User.findOne({email:req.body.email})
 if(!user)
 {
     return res.status(400).send("user not exists please signup") 
 }
 const isValid=await bcrypt.compare(req.body.password,user.password)
 if(!isValid) return res.status(400).send("incorrect Details")
const token=genAuthToken(user)
res.send(token)

})
module.exports=router