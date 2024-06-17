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
import RefreshToken from './models/RefreshToken.js'
import Poll from './models/postmodel.js'
import Followers from './models/followers.js';
import Liked from './models/liked.js'
import Comment from './models/comments.js';
import {Server} from 'socket.io';
import http from 'http'
import authMiddleware from './middleware/authMiddleware.js';
///////////////////////////////////////////////////

dotenv.config();
const app = express();
const server= http.createServer(app)
app.use(cors());
const io = new Server(server,{
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
app.use(express.json());
app.use('/uploads',express.static('uploads'));

///////////////////////////////////////////////////

io.on('connection', (socket) => {
    socket.on('comments', (data) => {
        console.log('new comment received', data);
        socket.broadcast.emit('comment', data);
    });
    socket.on('votes', (votes) => {
        console.log('update in votes: ', votes);
        socket.broadcast.emit('vote', votes);
    });
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

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
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await FormDataModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const accessToken = jwt.sign({ userId: user._id }, process.env.Accesstoken, { expiresIn: '30m' });
        const refreshToken = jwt.sign({ userId: user._id }, process.env.Refreshtoken);

        const newRefreshToken = new RefreshToken({ token: refreshToken, userId: user._id });
        await newRefreshToken.save();

        res.json({
            accessToken:accessToken,
            refreshToken:refreshToken,
            username: user.username,
            name: user.name,
            email: user.email,
            avatar: user.avatar
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//refresh api
app.post('/api/refresh-token', async (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token is required' });
    }

    try {
        const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
        if (!tokenDoc) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        jwt.verify(refreshToken, 'your_refresh_secret_key', (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }
            const accessToken = generateAccessToken(decoded.userId);
            res.json({ accessToken });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

//create_post
app.post('/api/create_poll', upload.array('optionImages', 10),authMiddleware, async (req, res) => {
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
app.post('/api/update_user', upload.single('avatar'),authMiddleware, async (req, res) => {
    const { field, value, username } = req.body;
    const allowedFields = ['name', 'email', 'password', 'username', 'avatar'];

    if (!allowedFields.includes(field)) {
        return res.status(400).json({ msg: `Field '${field}' cannot be updated` });
    }

    try {
        let update = { [field]: value };

        if (field === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return res.status(400).json({ msg: 'Invalid email format' });
            }

            const existingUser = await FormDataModel.findOne({ email: value });
            if (existingUser && existingUser.username !== username) {
                return res.status(400).json({ msg: `Email '${value}' is already in use` });
            }
        }

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
app.post('/api/polls',authMiddleware, async (req, res) => {
    try {
        const { place, username, followuser } = req.body;
        let polls;

        if (place === 'mypolls') {
            polls = await Poll.find({ username }).sort({ createdAt: -1 });
        } else if (place === 'likedpolls') {
            const likedPolls = await Liked.find({ usernames: username }).populate('pollid');
            polls = likedPolls.map(liked => liked.pollid).sort((a, b) => b.createdAt - a.createdAt);
        } else if (place === 'home') {
            polls = await Poll.find({ username: { $ne: username } }).sort({ createdAt: -1 });
        } else if (place == "following") {
            polls = await Poll.find({ username: followuser }).sort({ createdAt: -1 });
        }

        const liked = await Liked.find({ pollid: { $in: polls.map(poll => poll._id) } });

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
app.post('/api/follow',authMiddleware, async (req, res) => {
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
app.post('/api/update_likes/:pollid',authMiddleware, async (req, res) => {
    try {
        const { pollid } = req.params;
        const { username } = req.body;

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
app.post('/api/check_like',authMiddleware, async (req, res) => {
    try {
        const { pollid, username } = req.body;

        const liked = await Liked.findOne({ pollid });

        if (!liked) {
            return res.status(200).json({ isLiked: false });
        }

        const isLiked = liked.usernames.includes(username);

        res.status(200).json({ isLiked });
    } catch (error) {
        console.error('Error checking like status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// checkfor follow
app.post('/api/check_follow',authMiddleware, async (req, res) => {
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
app.post('/api/comment',authMiddleware, async (req, res) => {
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
app.get('/api/comments/:pollId',authMiddleware, async (req, res) => {
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
app.post('/api/users-i-follow/:username',authMiddleware, async (req, res) => {
    try {
      const { username } = req.params;
      const usersIFollow = await Followers.find({ followers: username });
  
      if (!usersIFollow || usersIFollow.length === 0) {
        return res.status(200).json([]);
      }

      const userDetails = await FormDataModel.find({ username: { $in: usersIFollow.map(u => u.username) } });
  
      res.status(200).json(userDetails);
    } catch (error) {
      console.error('Error fetching users I follow:', error);
      res.status(500).json({ msg: 'Internal server error' });
    }
  });
  //voteapi
  app.post('/api/vote',authMiddleware, async (req, res) => {
    try {
        const { pollId, optionIndex, username, deselect } = req.body; // Add deselect to request body

        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const voterIndex = poll.voters.findIndex(voter => voter.username === username);

        if (deselect) {
            if (voterIndex !== -1) {
                const previousOptionIndex = poll.voters[voterIndex].optionIndex;
                poll.options[previousOptionIndex].votes -= 1;
                poll.voters.splice(voterIndex, 1);
            }
        } else {
            if (voterIndex !== -1) {
                const previousOptionIndex = poll.voters[voterIndex].optionIndex;
                poll.options[previousOptionIndex].votes -= 1;
                poll.options[optionIndex].votes += 1;
                poll.voters[voterIndex].optionIndex = optionIndex;
            } else {
                poll.options[optionIndex].votes += 1;
                poll.voters.push({ username, optionIndex });
            }
        }

        await poll.save();

        res.status(200).json({ message: 'Vote registered successfully', poll });
    } catch (error) {
        console.error('Error voting on poll:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//vote-check
app.post('/api/check_vote',authMiddleware, async (req, res) => {
    try {
        const { pollId, username } = req.body;

        const poll = await Poll.findById(pollId);

        if (!poll) {
            return res.status(404).json({ message: 'Poll not found' });
        }

        const voter = poll.voters.find(voter => voter.username === username);
        const hasVoted = !!voter;
        const optionIndex = hasVoted ? voter.optionIndex : null;

        res.status(200).json({ hasVoted, optionIndex });
    } catch (error) {
        console.error('Error checking vote status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//editpoll
app.post('/api/update_poll/:pollId', upload.array('optionImages', 10), authMiddleware, async (req, res) => {
    const { pollId } = req.params;
    const { title, content, options } = req.body;

    try {
        const existingPoll = await Poll.findById(pollId);

        if (!existingPoll) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        existingPoll.title = title;
        existingPoll.content = content;

        existingPoll.options = JSON.parse(options).map((option, index) => {
            const existingOption = existingPoll.options.find(opt => opt.text === option.text);
            const imagePath = req.files[index] ? req.files[index].filename : null;
            
            if (existingOption) {
                existingOption.text = option.text;
                existingOption.image = imagePath;
                return existingOption;
            } else {
                return {
                    text: option.text,
                    image: imagePath
                };
            }
        });
        await existingPoll.save();

        res.json({ message: 'Poll updated successfully', poll: existingPoll });
    } catch (error) {
        console.error('Error updating poll:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//delete poll
app.post('/api/delete_poll/:pollId',authMiddleware, async (req, res) => {
    const { pollId } = req.params;
    try {
        const poll = await Poll.findByIdAndDelete(pollId);
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        res.json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Error deleting poll:', error);
        res.status(500).send('Internal server error');
    }
});

app.get('/api/poll/:pollid', authMiddleware, async (req, res) => {
    const { pollid } = req.params;
    try {
        const poll = await Poll.findById(pollid);
        if (!poll) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        res.json(poll);
    } catch (error) {
        console.error('Error fetching poll details:', error);
        res.status(500).send('Internal server error');
    }
});





////////////////////////////////////////////////////////////
const port=process.env.PORT || 8000;

server.listen(port, () => {
    console.log("Server listining on some port");

});