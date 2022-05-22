require("dotenv").config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express()
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(session({
    secret: process.env.SESSIONKEY,
    resave: false,
    saveUninitialized: true
  }))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/userDB")

const userSchema = new mongoose.Schema({
    username:{
        type: String
    },
    password:{
        type: String
    }
})

userSchema.plugin(passportLocalMongoose)

const User = new mongoose.model("User",userSchema)

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//  GET requests
app.get("/",function (req,res) {
    res.render("home")
})

app.get("/login",function (req,res) {
    res.render("login")
})

app.get("/register",function (req,res) {
    res.render("register")
})

app.get("/secrets", function (req,res) {
    if (req.isAuthenticated()) { //Verifies if the user is autenticated
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
})

app.get("/logout", function (req,res) {
    // Logs Out the user
    req.logout()
    res.redirect("/")
})

// POST requests
app.post("/register",function (req,res) {
    //Registers the user, add user credentials in database and sends an authentication cookie
    User.register({username:req.body.username},req.body.password, function (err,user) {
        if (err){
            console.log(err)
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req,res,function () {
                console.log("Authencitate done!");
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login",function (req,res) {
    // Uses to user given credentials to authenticate 
    const newUser = new User({
            username: req.body.username,
            password: req.body.password
        })
    req.login(newUser, function (err) {
        if (err) {
            console.log(err);
        }else {
            passport.authenticate("local")(req,res,function () {
                res.redirect("/secrets")
            })
        }
    })
    
})

// Listens on port 3000
app.listen(3000,function() {
    console.log("Listening at Port 3000....")
})