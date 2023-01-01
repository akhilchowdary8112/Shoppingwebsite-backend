const { User } =require("../models/Users")
const{auth,isUser,isAdmin} =require("../middleware/auth")
const bcrypt =require("bcrypt")
const moment=require("moment");
const e = require("express");
const router=require("express").Router();

//user details

router.get('/users',isAdmin,async(req,res)=>{
    try{
        const users=await User.find().sort({_id:-1});
        res.status(200).send(users)

    }
    catch(error){
res.status(500).send(error)
    }
})
//delete user
router.delete("/users/:id",isAdmin,async(req,res)=>{
    try{     
    const deleteuser =await User.findByIdAndRemove(req.params.id)
    res.status(200).send(deleteuser)
    }
    catch(error){
        res.status(200).send(error)
    }
})
//get user
router.get("/users/find/:id",isUser,async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        res.status(200).send({
            _id:user._id,
            name:user.name,
            isAdmin:user.isAdmin,
            email:user.email
        })

    }catch(error){
         res.status(200).send(error)

    }
})
//user stats
router.get('/stats',isAdmin,async(req,res)=>{
    const previousMonth=moment()
    .month(moment().month()-1)
    .set("date",1)
    .format("YYYY-MM-DD HH:mm:ss");
   try{
    const users=await User.aggregate([
        {
            $match:{createdAt:{$gte:new Date(previousMonth)}},
        },
        {
            $project:{
                month:{$month:"$createdAt"}
            }
        },
        {
        $group:{
            _id:"$month",
            total:{$sum:1}

        }
    }
    ])
 res.status(200).send(users)
   }
   catch(err){
    console.log(err)
    res.status(500).send(err);

   }
})
router.get('/Totalusers',isAdmin,async(req,res)=>{
    try{
         const users=await User.find()
         res.status(200).send(users)

   }
   catch(err){
    console.log(err)
    res.status(500).send(err);

   }
})
//update User
router.put("/users/:id",isUser,async(req,res)=>{
    try{
        const user=await User.findById(req.params.id)
        if(!user.email===req.body.email){
        const emailInUse=await User.findOne({email:req.body.email})
        if(emailInUse)
        return res.status(400).send(" Given mail is already Taken")
    }
        if(req.body.password && user){
            
        const salt=await bcrypt.genSalt(10)
updatedpassword=await bcrypt.hash(req.body.password,salt)
        }

const updatedUser=await User.findByIdAndUpdate(
    req.params.id,
    {
        name:req.body.name,
        email:req.body.email,
        password:updatedpassword,
        isAdmin:req.body.isAdmin

    },{
        new:true
    }
);

res.status(200).send({
    _id:updatedUser._id,
    name:updatedUser.name,
    email:updatedUser.email,
    isAdmin:updatedUser.isAdmin
})
        }catch(error){
            res.status(500).send(error)

        }
})
module.exports=router 

