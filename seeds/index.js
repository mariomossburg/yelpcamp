const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    //useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("database conectado");
});

const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //My user ID
            author: '65dd0dfb3f6e2a42d8238fed',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            //image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Curabitur convallis, justo ut suscipit hendrerit, ligula est malesuada odio. Quisque vel massa ut arcu ultrices vestibulum. Integer at dui sed metus feugiat hendrerit. Nam nec dapibus nisi, vel fringilla ipsum.',
            price, 
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
      url: 'https://res.cloudinary.com/dbarvkvcq/image/upload/v1709145577/YelpCamp/irwzquetxmycaxahlj96.jpg',
      filename: 'YelpCamp/irwzquetxmycaxahlj96'
    },
    {
      url: 'https://res.cloudinary.com/dbarvkvcq/image/upload/v1709145577/YelpCamp/f5puuq9e7vic4im7q3jt.jpg',
      filename: 'YelpCamp/f5puuq9e7vic4im7q3jt'
    },
    {
      url: 'https://res.cloudinary.com/dbarvkvcq/image/upload/v1709145577/YelpCamp/cdf5bwisptha3ldneqph.jpg',
      filename: 'YelpCamp/cdf5bwisptha3ldneqph'
      
    }
            ]
        })
        await camp.save();

    }
}

seedDB().then(() => {
    mongoose.connection.close();
})