const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

// Models
const User = require("./models/User");
const Property = require("./models/Property");

// Connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const owners = [
  { name: "Sarah Jenkins", email: "sarah@example.com", phone: "555-0101" },
  { name: "Michael Chen", email: "michael@example.com", phone: "555-0102" },
  { name: "David Rodriguez", email: "david@example.com", phone: "555-0103" },
  { name: "Emma Thompson", email: "emma@example.com", phone: "555-0104" },
  { name: "James Wilson", email: "james@example.com", phone: "555-0105" },
];

const locations = [
  "Koramangala, Bangalore", "Indiranagar, Bangalore", "Whitefield, Bangalore", "HSR Layout, Bangalore",
  "Bandra West, Mumbai", "Andheri East, Mumbai", "Powai, Mumbai", "South Bombay, Mumbai",
  "Connaught Place, Delhi", "Vasant Kunj, Delhi", "Hauz Khas, Delhi", "Saket, Delhi",
  "Gachibowli, Hyderabad", "Banjara Hills, Hyderabad", "Jubilee Hills, Hyderabad", "Madhapur, Hyderabad",
  "Salt Lake, Kolkata", "New Town, Kolkata", "Ballygunge, Kolkata", "Alipore, Kolkata"
];

const types = ["Apartment", "House", "Villa", "Studio"];
const furnishings = ["Furnished", "Semi-Furnished", "Unfurnished"];
const adjectives = ["Luxurious", "Cozy", "Spacious", "Modern", "Elegant", "Beautiful", "Stunning", "Premium"];
const features = ["with City View", "Near Metro Station", "in Gated Community", "with Pool Access", "Newly Renovated"];

const images = [
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687931-cebf004f1418?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18efc2291?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4ea0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
];

const seedDB = async () => {
  await connectDB();

  try {
    console.log("Clearing existing sample data...");
    // Only delete properties created by these specific test owners to not wipe user's actual data
    const existingTestOwners = await User.find({ email: { $in: owners.map(o => o.email) } });
    const existingTestOwnerIds = existingTestOwners.map(o => o._id);
    await Property.deleteMany({ ownerId: { $in: existingTestOwnerIds } });
    await User.deleteMany({ email: { $in: owners.map(o => o.email) } });

    console.log("Creating 5 Owner accounts...");
    const createdOwners = [];
    for (const ownerData of owners) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("123456", salt);
      
      const owner = await User.create({
        name: ownerData.name,
        email: ownerData.email,
        phone: ownerData.phone,
        password: hashedPassword,
        role: "Owner"
      });
      createdOwners.push(owner);
    }

    console.log("Generating 25 properties...");
    const propertiesToCreate = [];
    
    for (let i = 0; i < 25; i++) {
      const owner = createdOwners[Math.floor(Math.random() * createdOwners.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const furnished = furnishings[Math.floor(Math.random() * furnishings.length)];
      const bhk = Math.floor(Math.random() * 4) + 1; // 1 to 4
      
      const title = `${bhk} BHK ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${type} ${features[Math.floor(Math.random() * features.length)]}`;
      const price = Math.floor(Math.random() * 80) * 1000 + 10000; // 10k to 90k
      
      // Select 2-3 random images
      const numImages = Math.floor(Math.random() * 2) + 2;
      const propertyImages = [];
      for(let j=0; j<numImages; j++) {
        propertyImages.push(images[Math.floor(Math.random() * images.length)]);
      }

      propertiesToCreate.push({
        title,
        description: `This is a beautiful ${bhk} bedroom ${type} located in the heart of ${location}. It comes ${furnished.toLowerCase()} and is perfect for families or professionals looking for a premium lifestyle. Features 24/7 security, power backup, and modern amenities.`,
        price,
        location,
        type,
        bhk,
        furnished,
        images: propertyImages,
        ownerId: owner._id,
        coordinates: {
          lat: 19.0760 + (Math.random() - 0.5) * 0.1, // Approximate India coords
          lng: 72.8777 + (Math.random() - 0.5) * 0.1
        }
      });
    }

    await Property.insertMany(propertiesToCreate);
    console.log("Database successfully seeded with 5 Owners and 25 Properties!");
    
    console.log("\n--- TEST OWNER ACCOUNTS ---");
    owners.forEach(o => console.log(`Email: ${o.email} | Password: 123456`));
    console.log("---------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("Error with data import", error);
    process.exit(1);
  }
};

seedDB();
