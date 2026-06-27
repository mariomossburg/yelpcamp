//To run in terminal:
//mongosh
// --> mongod
//
//node app.js
//push to main
//git push -u origin main
//npx nodemon app.js
//npm i cookie-parser
//https://getbootstrap.com/docs/5.0/components

//deployed: https://yelpcamp-8umd.onrender.com/campgrounds


if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const eJsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const userRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const MongoStore = require('connect-mongo');
// const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
const dbUrl = process.env.DB_URL;


mongoose.connect(dbUrl, {
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

// Default locals so EJS templates never reference undefined variables
app.use((req, res, next) => {
    res.locals.currentUser = null;
    res.locals.success = [];
    res.locals.error = [];
    next();
});

app.use(express.urlencoded({ extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname,'public')));

const secret = process.env.SECRET || "thisshouldbeabettersecret";

const store = MongoStore.create({
    mongoUrl: dbUrl,
    
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret'
    }
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
   //     secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }

}

app.use(session(sessionConfig))
app.use(flash());
// Temporarily disable helmet for local development testing
// app.use(helmet({
//     hsts: false
// }));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    //console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
 })

//  app.get('/fakeUser', async (req, res) => {
//     const user = new User({email: 'alien@gmail.com', username: 'allieens'});
//     const newUser = await User.register(user, 'chicken');
//     res.send(newUser);

//  })

app.use('/', userRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/reviews', reviewsRoutes);

app.get('/', (req,res) => {
    res.render('home')
});


app.all('*', (req,res,next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    console.error('ERROR:', err);
    const { statusCode = 500 } = err;
    if(!err.message) err.message = 'Oh no, Something Went Wrong!'
    if(res.headersSent) {
        return res.end();
    }
    res.status(statusCode).render('error', { err, currentUser: null, success: [], error: [] })
})

const port = 3000;
const host = '0.0.0.0'; 
app.listen(port, host, () => {
    console.log(`serving on ${host}:${port}`)
})