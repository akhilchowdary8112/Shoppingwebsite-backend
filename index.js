const express=require("express")
const cors=require("cors")
const products=require("./Products")
const mongoose=require("mongoose")
const nodemon = require("nodemon")
const register=require("./routes/Register")
const Signin=require("./routes/Signin")
const Stripe=require("./routes/Stripe")
const productsroute=require("./routes/Products")
const bodyParser = require("body-parser");
const Stats=require("./routes/User")
const Orders=require("./routes/Order")
require("dotenv").config()
const app=express()
app.use(cors())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.json())
const port=process.env.PORT ||3000
const connection_string=process.env.DB_URL
app.listen(port,console.log(`server running on port ${port}`))
mongoose.set("strictQuery", false);
mongoose.connect(connection_string)  
.then(() => console.log("connection established"))
.catch((error) => console.error("connection error ",error.message))

app.use("/api/register",register)
app.use("/api/Signin",Signin)
app.use("/api/stripe",Stripe)
app.use("/api/products",productsroute)
app.use("/api/users",Stats)
app.use("/api/users",Orders)

app.get("/",(req,res)=>{
    res.send(`welcome to Seasonal Store  `)
})
app.get("/products",(req,res)=>{
    res.send(products)
}
)
