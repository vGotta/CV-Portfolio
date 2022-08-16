import express from 'express'
import mongoose from 'mongoose'
import multer from 'multer'
import projectModel from './models/project.js';
import session from "express-session";
import { createTestAccount, createTransport, getTestMessageUrl } from "nodemailer";
import authguard from './customDependencies/authguard.js';

import 'dotenv/config';
import UserModel from './models/user.js';

const db = process.env.BDD_URL
const app = express()
const router = express.Router()

app.use(session({secret: process.env.SECRET, saveUninitialized: true,resave: true}));
app.use(express.urlencoded({ extended: true }))
app.use(express.static('./assets'))
app.use(router)

/****** node mailer *********/

router.post('/home', async (req, res) => {
    console.log(req.body);

    const transporter = createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.PASSWORD
        }
    })

    const mailOptions = {
        from: req.body.email,
        to: process.env.GMAIL_USER,
        name: req.body.name,
        subject: req.body.subject,
        text: req.body.message
    }

    transporter.sendMail(mailOptions, (error, info)=>{
        if (error) {
            console.log(error);
            res.send('error')
        }else{
            console.log('Email sent: ');
            res.redirect('/home/#contact-form')
        }
    })

   });  





/****** multer *********/


const storage = multer.diskStorage({
    // destination pour le fichier
    destination: function (req, file, callback) {
        callback(null, './assets/uploads/images')
    },
    //ajouter le retour de l'extension
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname)//date d'aujourd'hui concaténé au nom de l'image
    },
})

/****** upload parametre pour multer *********/

const upload = multer({
    storage: storage,
    limits: {
        fieldSize: 1024 * 1024 * 3,
    },
})

mongoose.connect(db, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("connected to database mongodb (c'est dur....)");
    }
})

app.listen(3000, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('conected at 3000');
    }
})

/******** Page Home *********/

app.get("/home", async (req, res) => {
    let projects = await projectModel.find()
    res.render("./home.twig",{
        projects: projects
    })
})

/******** Page Intro ********/

app.get("/intro", async (req, res) => {
    res.render("./intro.twig")
})

/********* Page Login *********/

app.get("/login",  async (req, res) => {
    res.render("./login.twig")
})

app.post("/login", async (req, res) => {
    console.log(req.body);
    let user = await UserModel.findOne({mail: req.body.mail, password: req.body.password})
    if (user) {
        req.session.user = user._id
        res.redirect('/addProject')
    } else {
        res.redirect("/login")

    }
})

/********* Page Ajout Projet *********/

app.get("/addProject", authguard , async (req, res) => {
    let errors = req.session.error
    req.session.error = ""
    res.render("./addProject.twig",{
        errors: errors
    })
})

app.post("/addProject", upload.single('image'), async (req, res) => {
    try {
        if (req.file) {
            req.body.img = req.file.filename
        }
        let project = new projectModel(req.body)
        const error = project.validateSync();
        if (error) {
            throw(error)
        }
        project.save()
        res.redirect('/home') 
    } catch (error) {
        req.session.error = Object.values(error.errors);
        res.redirect('/addProject')
    }
  
})


