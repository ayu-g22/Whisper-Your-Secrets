//jshint esversion:6
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

const secret="My secret secret";

userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password']  });

const user=mongoose.model('user',userSchema);

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
        else
         res.render('secrets');
    });
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

app.listen(3000,function(){
    console.log("Serving at port 3000");
});