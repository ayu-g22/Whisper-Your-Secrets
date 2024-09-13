//jshint esversion:6
require('dotenv').config();
const express=require('express');
const bodyParser=require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const encrypt= require('mongoose-encryption');
const app=express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended:true
}));

app.use(express.static('public'));

mongoose.connect('mongodb://localhost/userDB',{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    userName:String,
    password:String
});

const secretSchema=new mongoose.Schema({
    content:String,
});

const secret=process.env.SECRET;

userSchema.plugin(encrypt, { secret : secret, encryptedFields: ['password']  });

const user=mongoose.model('user',userSchema);
const Secret=mongoose.model('secret',secretSchema);

app.get('/',function(req,res){
    res.render("home");
})

app.get('/login',function(req,res){
    res.render("login");
})

app.get('/register',function(req,res){
    res.render("register");
})

app.post('/register',function(req,res){
    const u1=new user({
        userName:req.body.username,
        password:req.body.password
    });
    u1.save(function(err){
        if(err)
         res.send(err);
        else{
                Secret.find({})
        .then(secrets => {
        res.render('secrets', { secrets: secrets });
        })
        .catch(err => res.status(500).send('Error fetching secrets:', err));
            }
        });
})

app.delete('/delete-secret/:id', async (req, res) => {
    try {
      await Secret.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.json({ success: false, error: error.message });
    }
  });

app.get('/secrets',(req,res)=>{
    Secret.find({})
    .then(secrets => {
      res.render('secrets', { secrets: secrets });
    })
    .catch(err => res.status(500).send('Error fetching secrets:', err));
})

app.post('/login',function(req,res){
    const uname=req.body.username;
    const pass=req.body.password;
    user.findOne({userName:uname},function(err,found){
        if(err)
         res.send(err);
        else if(found)
        {
            if(found.password=== pass)
             res.render('secrets');
        }
    })
})

app.get('/submit',(req,res)=>{
    res.render('submit');
});

app.post('/submit',async (req,res)=>{
    const newSecret = new Secret({
        content: req.body.secret
      });
    
      try {
        await newSecret.save();  // Synchronous-like save operation
        res.redirect('/secrets'); // Redirect to display all secrets
      } catch (err) {
        res.status(500).send('Error saving secret: ' + err);
      }
        Secret.find({})
        .then(secrets => {
          res.render('secrets', { secrets: secrets });
        })
        .catch(err => res.status(500).send('Error fetching secrets:', err));
});

app.listen(4000,function(){
    console.log("Serving at port 4000");
});
