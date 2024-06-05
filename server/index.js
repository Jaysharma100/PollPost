import cors from 'cors';
import express from 'express';
import FormDataModel  from './models/usermodel.js';
import connection from './database/db.js';
import dotenv from 'dotenv'
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import token from './models/token.js'
import Poll from './models/postmodel.js'
///////////////////////////////////////////////////

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads',express.static('uploads'));
///////////////////////////////////////////////////

const storage = multer.diskStorage({
    destination: (req, file, cb)=>{
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage,limits:{fileSize:"50mb"}});

//////////////////////////////////////////////////////////////////////////////////////////
connection(process.env.MongodbURL);

//signup//
app.post('/api/signup',upload.single('avatar'), async (req, res)=>{
    const {name,email,password,username} = req.body;
    const salt =await bcrypt.genSalt();
    const hashpassword= await bcrypt.hash(password,salt);

    await FormDataModel.findOne({email: email})
    .then( async (user) => {
        if(user){
            res.status(200).send({msg:"Email already registered with us, try direct login"})
        }
        else{
            await FormDataModel.create({
                name:name,
                email:email,
                password:hashpassword,
                username:username,
                avatar:'uploads/'+ req.file.filename
             })
            .then( e => res.staus(200).send({msg:"User signed up Successfully"}))
            .catch(err => res.send(err))
        }
    })
    console.log(req.body);
})

//login//
app.post('/api/login', async (req, res)=>{
    const {email, password} = req.body;
    let user = await FormDataModel.findOne({email: email})
        if(user){
            try{
                console.log("inside findone")
                let match= await bcrypt.compare(password,user.password);
                if(match){
                    console.log("matched");
                    const accesstoken=jwt.sign(user.toJSON(),process.env.Accesstoken,{expiresIn: '15m'});
                    const refreshtoken=jwt.sign(user.toJSON(),process.env.Refreshtoken);
                    console.log("matched2");
                    const newtoken= await token.create({token: refreshtoken})

                    return res.status(200).json({accesstoken: accesstoken,refreshtoken:refreshtoken, name: user.name, username: user.username,email: user.email, avatar: user.avatar});
                }
                else{
                    return res.staus(400).json({msg: 'check email or password'});
                }
            }
            catch(error){
                console.log("some error occured", error);
                return res.status(500).json({msg: 'something went wrong...'})
            }
        }
        else{
            console.log("no records wwala");
            res.status(404).json("No records found! ");
        }
})

//create_post
app.post('/api/create_poll', upload.array('optionImages', 10), async (req, res) => {
    try {
        const { title, content, options } = req.body;

        // Parse the options JSON string (if it's not already an object)
        const parsedOptions = JSON.parse(options);

        // Map the parsed options to include image filenames
        const optionsWithImages = parsedOptions.map((option, index) => {
            return {
                text: option.text,
                image: req.files[index] ? req.files[index].filename : null,
            };
        });

        // Create a new poll
        const newPoll = new Poll({
            title,
            content,
            options: optionsWithImages,
        });

        // Save the poll to the database
        await newPoll.save();

        res.status(201).json({ message: 'Poll created successfully', poll: newPoll });
    } catch (error) {
        console.error('Error creating poll:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


////////////////////////////////////////////////////////////

app.listen(8000, () => {
    console.log("Server listining on http://127.0.0.1:3001");

});