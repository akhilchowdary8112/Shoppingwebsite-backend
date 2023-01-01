const dotenv=require("dotenv")
const cloudinaryModule=require("cloudinary")
dotenv.config()
const cloudniary=cloudinaryModule.v2
cloudinaryModule.config({
    cloud_name:process.env.Cloudinary_Name,
    api_key:process.env.Cloudinary_Api,
    api_secret:process.env.Cloudinary_Secret,
})
module.exports=cloudniary;