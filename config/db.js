const mongoose  = require('mongoose');
const url = process.env.MONGO_URL;

mongoose.connect(url)
.then(()=>{
    console.log("Mongodb connected....")
}).catch((err)=>{
    console.log("Error while connection mongodb",err)
})