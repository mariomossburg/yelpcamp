//To run in terminal type
//mongosh --> mongod
//node app.js
//push to main
//git push -u origin main
//npx nodemon app.js
//npm i cookie-parser
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const eJsMate = require('ejs-mate');
const session = require('express-session');
const  flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./model/user')


const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews')

mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true,
    //useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database conectado");
});

const app = express();

app.engine('ejs', eJsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const sessionConfig = {
    secret: "thisisbadsecret",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}

app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize);
app.use(passport.session);
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
 })

app.use('/campgrounds', campgrounds);
app.use('/campgrounds/:id/reviews', reviews);

app.get('/', (req,res) => {
    res.render('home')
});


app.all('*', (req,res,next)=>{
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    //console.error(`Error: ${statusCode} - ${message}`);
    //console.error(err.stack);
        if(!err.message) err.message = 'Oh no, Something Went Wrong!'
    res.status(statusCode).render('error', {err})
})

app.listen(3000, () => {
    console.log('serving in port 3000')
})