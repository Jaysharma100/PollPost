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
import Followers from './models/followers.js';
import Liked from './models/liked.js'
import Comment from './models/comments.js';
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
})

//login//
app.post('/api/login', async (req, res)=>{
    const {email, password} = req.body;
    let user = await FormDataModel.findOne({email: email})
        if(user){
            try{
                let match= await bcrypt.compare(password,user.password);
                if(match){
                    const accesstoken=jwt.sign(user.toJSON(),process.env.Accesstoken,{expiresIn: '15m'});
                    const refreshtoken=jwt.sign(user.toJSON(),process.env.Refreshtoken);
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
        const { title, content, options, username } = req.body;

        const parsedOptions = JSON.parse(options);

        const optionsWithImages = parsedOptions.map((option, index) => {
            return {
                text: option.text,
                image: req.files[index] ? req.files[index].filename : null,
            };
        });

        const newPoll = new Poll({
            title,
            content,
            options: optionsWithImages,
            username,
        });

        await newPoll.save();

        res.status(201).json({ message: 'Poll created successfully', poll: newPoll });
    } catch (error) {
        console.error('Error creating poll:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//update_user method
app.post('/api/update_user', upload.single('avatar'), async (req, res) => {
    const { field, value, username } = req.body;
    const allowedFields = ['name', 'email', 'password', 'username', 'avatar'];

    // Check if the field to be updated is allowed
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ msg: `Field '${field}' cannot be updated` });
    }

    try {
        let update = { [field]: value };

        if (field === 'email') {
            // Check if the new email has a valid format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return res.status(400).json({ msg: 'Invalid email format' });
            }

            // Check if the new email is already in use by another user
            const existingUser = await FormDataModel.findOne({ email: value });
            if (existingUser && existingUser.username !== username) {
                return res.status(400).json({ msg: `Email '${value}' is already in use` });
            }
        }

        // If updating the avatar, and a file is provided, update avatar path
        if (field === 'avatar' && req.file) {
            const user = await FormDataModel.findOne({ username: username });
            if (user && user.avatar) {
                fs.unlink(user.avatar, (err) => {
                    if (err) {
                        console.error('Error deleting old avatar:', err);
                    }
                });
            }
            update = { [field]: 'uploads/' + req.file.filename };
        }

        const user = await FormDataModel.findOneAndUpdate({ username: username }, update, { new: true });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        res.status(200).json({ msg: "User updated successfully", user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});
// Fetch all polls
app.post('/api/polls', async (req, res) => {
    try {
        const { place, username,followuser } = req.body;
        
        let polls;

        if (place === 'mypolls') {
            // Fetch polls created by the given username
            polls = await Poll.find({ username });
        } else if (place === 'likedpolls') {
            // Fetch polls liked by the given username
            const likedPolls = await Liked.find({ usernames: username }).populate('pollid');
            polls = likedPolls.map(liked => liked.pollid);
        } else if(place==='home'){
            polls = await Poll.find({ username: { $ne: username } });
        }else if(place=="following"){
            // Default case: Fetch all polls
            polls = await Poll.find({ username:followuser });
        }

        // Fetch likes for all polls
        const liked = await Liked.find({ pollid: { $in: polls.map(poll => poll._id) } });

        // Map likes to polls
        const pollsWithLikes = polls.map(poll => {
            const pollLikes = liked.find(like => like.pollid.equals(poll._id)) || { pollid: poll._id, usernames: [], totallikes: 0 };
            return {
                ...poll._doc,
                likes: pollLikes
            };
        });

        res.json({ polls: pollsWithLikes });
    } catch (error) {
        console.error('Error fetching polls:', error);
        res.status(500).json({ msg: 'Error fetching polls', error });
    }
});





// Follow/Unfollow user
app.post('/api/follow', async (req, res) => {
    const { currentUser,username} = req.body;

    try {
        let user = await Followers.findOne({ username });

        if (!user) {
            user = new Followers({ username:username, followers: [] });
        }

        const index = user.followers.indexOf(currentUser);
        if (index === -1) {
            user.followers.push(currentUser);
            await user.save();
            res.status(200).json({ success: true, message: `You followed ${username}`, followed: true });
        } else {
            user.followers.splice(index, 1);
            await user.save();
            res.status(200).json({ success: true, message: `You unfollowed ${username}`, followed: false });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});


//update_likes
app.post('/api/update_likes/:pollid', async (req, res) => {
    try {
        const { pollid } = req.params;
        const { username } = req.body; // Retrieve the username from the request body

        let liked = await Liked.findOne({ pollid });
        
        if (!liked) {
            liked = new Liked({ pollid, usernames: [username],totallikes:1 }); // Add the username to the list if it's not already present
        } else {
            const index = liked.usernames.indexOf(username);
            if (index === -1) {
                liked.usernames.push(username);
                liked.totallikes+=1;
            } else {
                liked.usernames.splice(index, 1);
                liked.totallikes-=1;
            }
        }
        await liked.save();
        res.status(200).json({ msg: 'Poll likes updated successfully', likes: liked });
    } catch (error) {
        console.error('Error updating poll likes:', error);
        res.status(500).json({ msg: 'Internal server error' });
    }
});
  
// Check if user has liked a poll
app.post('/api/check_like', async (req, res) => {
    try {
        const { pollid, username } = req.body;

        // Fetch the like entry for the poll
        const liked = await Liked.findOne({ pollid });

        if (!liked) {
            return res.status(200).json({ isLiked: false });
        }

        // Check if the username exists in the list of users who liked the poll
        const isLiked = liked.usernames.includes(username);

        res.status(200).json({ isLiked });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// checkfor follow
app.post('/api/check_follow', async (req, res) => {
    const { currentUser, username } = req.body;

    try {
        const user = await Followers.findOne({ username });

        if (user && user.followers.includes(currentUser)) {
            res.status(200).json({ isFollowing: true });
        } else {
            res.status(200).json({ isFollowing: false });
        }
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//postcomment
app.post('/api/comment', async (req, res) => {
    const { pollId, username, text } = req.body;

    try {
        const newComment = new Comment({
            pollId,
            username,
            text
        });

        await newComment.save();
        res.status(201).json({ message: 'Comment saved successfully', comment: newComment });
    } catch (error) {
        console.error('Error saving comment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch comments for a poll
app.get('/api/comments/:pollId', async (req, res) => {
    const { pollId } = req.params;

    try {
        const comments = await Comment.find({ pollId }).sort({ time: -1 });
        res.status(200).json({ comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Fetch users that the current user is following
app.post('/api/users-i-follow/:username', async (req, res) => {
    try {
      const { username } = req.params;
      // Find all users where the current username is in their followers array
      const usersIFollow = await Followers.find({ followers: username });
  
      if (!usersIFollow || usersIFollow.length === 0) {
        return res.status(200).json([]); // Return empty array if no users are found
      }
  
      // Get the user details from the user model based on usernames found
      const userDetails = await FormDataModel.find({ username: { $in: usersIFollow.map(u => u.username) } });
  
      res.status(200).json(userDetails);
    } catch (error) {
      console.error('Error fetching users I follow:', error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });
  




////////////////////////////////////////////////////////////

app.listen(8000, () => {
    console.log("Server listining on http://127.0.0.1:3001");

});