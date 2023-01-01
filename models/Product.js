const mongoose=require("mongoose")
const Productschema=mongoose.Schema({
    name:{type:String,required:true},
    brand:{type:String,required:true},
    desc:{type:String,required:true},
    price:{type:String,required:true},
    image:{type:Object,required:true}
},{
    timestamps:true
})
const products=mongoose.model("products",Productschema)
exports.products=products