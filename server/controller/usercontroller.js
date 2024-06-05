import User from '../models/usermodel.js'

const signupUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        console.log("inside usercontroll");
        const user= new User({
            name: name,
            email: email,
            password: password
        })
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error while creating user', error });
    }
};

export default signupUser;
