const mongoose = require('mongoose');
const campground = require('../campground');
const cities = require('./cities')
const {places, decriptors, descriptors} = require('./seed-helpers')


mongoose.connect('mongodb://localhost:27017/yelpcamp', {
    useNewUrlParser: true ,
    useUnifiedTopology: true,
    useCreateIndex: true,
})
.then(() =>{
    console.log('database connected');
})
.catch(error => 
    handleError(error)); 


const sample = array => array[Math.floor(Math.random()* array.length)];

// this is a perfect example of an async function

const seedDB = async () => {
await campground.deleteMany({});
for(let i=0; i<50; i++)   {
    const random1000 = Math.floor(Math.random()* 1000);
    const price = Math.floor(Math.random()* 20) + 10;
    const camp = new campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title:`${sample(places)} ${sample(descriptors)}`,
            description:'lorem iidemindu 2nwidn  idnwqindikw diwnd wd iwndikn wjq dwq',
            price,
            user : '60de19c9bc90c221888281cc' ,
            images: [
                {
                    url: 'https://res.cloudinary.com/dnuj7vklb/image/upload/v1625690350/YelpCamp/gm2tfrcvbbwfhtqmtdvp.jpg',
                    filename: 'YelpCamp/gm2tfrcvbbwfhtqmtdvp'
                },
                {
                    url: 'https://res.cloudinary.com/dnuj7vklb/image/upload/v1625690344/YelpCamp/gs6temmeart3ojw6gnur.jpg',
                    filename: 'YelpCamp/gs6temmeart3ojw6gnur'
                }
            ]
        })
    await camp.save();
}}

//this function needs to be called in order for the code to work.
seedDB().then(()=>{
    mongoose.connection.close();
})