import mongoose from "mongoose"

const connection= async (URL)=>{
    try{
      await mongoose.connect(URL,{useNewUrlParser: true,
useUnifiedTopology: true});
      console.log("connected to DB");
    }
    catch(error){
        console.log("error while connecting to DB",error);
    }
}

export default connection;