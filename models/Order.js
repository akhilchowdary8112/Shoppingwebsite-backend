const mongoose=require("mongoose")
const Orderdetails=mongoose.Schema({
     userId:{type:String,required:true},
     customerId:{type:String,required:true},
     paymentIntentId:{type:String,required:true},
          product:[],
subtotal:{type:Number,required:true},
total:{type:Number,required:true},
shipping:{type:Object,required:true},
delivery_status:{type:String,required:true,default:"pending"},
payment_status:{type:String,required:true},


},{
     timestamps:true
})
const order=mongoose.model("Orders",Orderdetails)
exports.Orders=order