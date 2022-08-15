//require the user model
const User = require("../userModel");


module.exports.renderRegister = (req,res) => {
    res.render('register')
}

module.exports.register = async(req,res, next) => {
    try{
        const{email,username,password} = req.body;
        const user = new User({email,username});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser, err =>{
            if(err) return next(err);
        })
        req.flash('success', 'Welcome to yelp camp')
        res.redirect('/campgrounds')
    } catch(e){
        req.flash('success', e.message);
        res.redirect('register')
    }
}

module.exports.renderLogin = (req,res) => {
    res.render('loginpage')
}

module.exports.loginPost = (req, res) => {
    req.flash('success','Welcome back')
    const url = req.session.returnTo || '/campgrounds';
    return res.redirect(url)
}

module.exports.logout = (req,res) => {
    req.logout();
    req.flash('success' , 'Logged Out');
    res.redirect('/campgrounds')
}