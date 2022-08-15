if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
console.log(process.env.secret)




//all the requirements

//makes the app an express app.
const express = require('express');
//to use mongoose and use the mongoDB database.
const mongoose = require('mongoose');
//to use the 'app'.
const app = express();
//to make the path accessible form everywhere.
const path = require('path');
//imoprt the campground model .
const campground = require('./campground');
//to override the post request and make it a put,patch or delete.
const methodOverride = require('method-override');
//makes it easy to include the ejs boilerplate(header and footer).
const ejsMate = require('ejs-mate');
//require joi for data validation 
const joi = require('joi');
//require the reviews model.  :)
const review = require('./review');
//require the express-session for sessions 
const session = require('express-session');
//to connect flash 
const flash = require("connect-flash")

const catchAsync = require('./utils/catchAsync')
const expressError = require('./utils/expresserr.js');
const { localsName } = require('ejs');


//for the passport config
const passport = require('passport');
const localStrategy = require('passport-local');
//require the user model
const User = require("./userModel");
//required file imports a function that ensures that the user is logged in
const isLoggedIn = require('./middlewares/islogin');

//controllers requirements
const campgroundsCont = require('./controllers/campgrounds')
const reviewsCont = require('./controllers/reviews');
const userCont = require('./controllers/users')

const multer = require('multer')
const {storage} = require('./cloudinary/index')
const upload = multer({storage})
const MongoDBStore = require("connect-mongo")(session);





//to connect to the mongo data base
const dbUrl =  process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

// to configure a session
const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7,
    }
}
 
// for ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


//data validation for reviews using joi
const reviewSchema1 = joi.object({
    review: joi.object({
        rating: joi.number().required(),
        body: joi.string().required()
    }).required()
})
//function decleration for data validation of reviews
const validateReview = (req,res,next) =>{
    const { error } = reviewSchema1.validate(req.body);
    if(error){
    const msg = error.details.map(el => el.message).join('.')
    throw new expressError(msg,400);
}else{
    next();
}
}

//function decleration for data validation of reviews
const validateCampground = (req,res,next) => {
const CampgroundSchema1 = joi.object({
    campground: joi.object({
        title : joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().required(),
        location: joi.string().required(),
        description: joi.string().required()
    }).required()
})
const { error } = CampgroundSchema1.validate(req.body);
if(error){
    const msg = error.details.map(el => el.message).join('.')
    throw new expressError(msg,400);
}else{
    next();
}
}


//ALL THE MIDDLEWARES

//FOR CONFIGURING A SESSION
app.use(session(sessionConfig))
app.use(flash())
// to use the req.params and access the body 
app.use(express.urlencoded({ extended: true }));
//to send a put or patch request(will have to require it before).
app.use(methodOverride("_method"));
// for using the ejs-mate for partials
app.engine('ejs', ejsMate);
// to serve the static files
app.use(express.static(path.join(__dirname,'public')))
// for the passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate())); // the 'User' here is refering to the user model we required and the local strategy is also something we required.
//thiss handles how to sttore and unstore the passwords
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//to access "success flash everywhere
app.use((req,res,next) =>{
    
    res.locals.success = req.flash('success');
    res.locals.currentUser = req.user;
    next();
})


const isAuthor = async(req,res,next) => {
    const {id} = req.params;
    const Campground = await campground.findById(id);
   if (!Campground.user.equals(req.user._id)) {
       req.flash('success' , 'shut the fuck up')
       return res.redirect('/campgrounds')
   }
   next();
}




//ALL THE ROUTES.

//home page GET request
app.get('/', (req,res) => {
     res.render('home')    
})

//route for rendering the campgrounds index page :)
app.get('/campgrounds',catchAsync(campgroundsCont.index));

//route for creating a new camp.
app.get('/campgrounds/new',isLoggedIn, campgroundsCont.renderNewForm)

// post request to add a camp.
 app.post('/campgrounds' ,upload.array('image'), catchAsync( campgroundsCont.createCamp));



//get request for editing a camp.
app.get('/campgrounds/:id/edit',isLoggedIn,isAuthor ,catchAsync(campgroundsCont.editCamp ));

// route for showing the description of a specific camp                                        
app.get('/campgrounds/:id',catchAsync( campgroundsCont.showCamp));

//put request for editing a camp
app.put('/campgrounds/:id',validateCampground ,catchAsync(campgroundsCont.editCampPut ));

//delete request for deleting a camp
app.delete('/campgrounds/:id',catchAsync(campgroundsCont.deleteCamp));

//Post route for posting a review
app.post("/campgrounds/:id/reviews",validateReview, catchAsync(reviewsCont.postR))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(reviewsCont.deleteR))

//user registration route
app.get('/register', userCont.renderRegister)
app.post('/register',catchAsync( userCont.register))

//user login routes
app.get('/login',userCont.renderLogin)

app.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), (userCont.loginPost))

//route for loging out
app.get('/logout',userCont.logout)


app.all('*',(req,res,next) => {
    next(new expressError('Page Not Found',404))
})

// error handling middleware
app.use((err,req,res,next) =>{
const { statusCode = 500} = err;
if(!err.message) err.message = 'Something Went Wrong' 
res.status(statusCode).render('error',{err});
})

const port = process.env.PORT || 3000;
//this is to connect the server to the port 3000(localhost:3000)in the browser.
app.listen(port, () =>{
    console.log('listening on port ')
})