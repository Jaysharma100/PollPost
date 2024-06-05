import express from 'express';

const router= express.Router();

router.post('/api/signup', async (req, res)=>{
    // To post / insert data into database

    const {name,email,password,username} = req.body;
    console.log(req.body);
     await FormDataModel.create({
        name:name,
        email:email,
        password:password,
        username:username
     })
    .then(log_reg_form => res.json(log_reg_form))
    .catch(err => res.json(err))
    
    // FormDataModel.findOne({email: email})
    // .then(user => {
    //     if(user){
    //         res.json("Already registered")
    //     }
    //     else{
    //         FormDataModel.create(req.body)
    //         .then(log_reg_form => res.json(log_reg_form))
    //         .catch(err => res.json(err))
    //     }
    // })
    
})

export default router