const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

// Models & Utils
const User = require("./models/User");
const Property = require("./models/Property");
const connectDB = require("./config/db");
const { buildPropertySearchText, generateEmbedding } = require("./services/embeddingService");

const owners = [
  { name: "Sarah Jenkins", email: "sarah@example.com", phone: "555-0101" },
  { name: "Michael Chen", email: "michael@example.com", phone: "555-0102" },
  { name: "David Rodriguez", email: "david@example.com", phone: "555-0103" },
  { name: "Emma Thompson", email: "emma@example.com", phone: "555-0104" },
  { name: "James Wilson", email: "james@example.com", phone: "555-0105" },
];

const locations = [
  "Chandigarh University Area, Chandigarh", "Sector 17, Chandigarh", "Mohali, Chandigarh",
  "Koramangala, Bangalore", "Indiranagar, Bangalore", "Whitefield, Bangalore", "HSR Layout, Bangalore",
  "Bandra West, Mumbai", "Andheri East, Mumbai", "Powai, Mumbai", "South Bombay, Mumbai",
  "Connaught Place, Delhi", "Vasant Kunj, Delhi", "Hauz Khas, Delhi", "Saket, Delhi",
  "Gachibowli, Hyderabad", "Banjara Hills, Hyderabad", "Jubilee Hills, Hyderabad", "Madhapur, Hyderabad",
  "Salt Lake, Kolkata", "New Town, Kolkata", "Ballygunge, Kolkata", "Alipore, Kolkata"
];

const types = ["Apartment", "House", "Villa", "Studio"];
const furnishings = ["Furnished", "Semi-Furnished", "Unfurnished"];
const adjectives = ["Luxurious", "Cozy", "Spacious", "Modern", "Elegant", "Beautiful", "Stunning", "Premium", "Affordable"];
const features = ["with City View", "Near Metro Station", "Near University Campus", "with Balcony", "with Reserved Parking", "Pet-Friendly with Garden", "Newly Renovated"];

const allAmenities = [
  "Parking", "Balcony", "WiFi", "Gym", "Power Backup", "Pet-Friendly", "Swimming Pool", "24/7 Security", "Elevator", "Garden"
];

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

    console.log("Generating 25 properties with vector embeddings...");
    const propertiesToCreate = [];

    // Pre-configured highlight properties for instant semantic demonstration
    const highlightProps = [
      {
        title: "2 BHK Furnished Apartment near Chandigarh University",
        description: "Modern, fully furnished 2 BHK apartment located just 5 minutes from Chandigarh University campus. Includes covered car parking, high-speed WiFi, private balcony, and 24/7 security. Ideal for university students, faculty, or small families looking for affordable rent.",
        price: 18000,
        location: "Chandigarh University Area, Chandigarh",
        type: "Apartment",
        bhk: 2,
        furnished: "Furnished",
        amenities: ["Parking", "Balcony", "WiFi", "24/7 Security", "Power Backup"]
      },
      {
        title: "Affordable 1 BHK Studio near University Campus",
        description: "Cozy and budget-friendly 1 BHK studio apartment near university with great connectivity to bus and metro stations. Perfect for students and young working professionals.",
        price: 12000,
        location: "Chandigarh University Area, Chandigarh",
        type: "Studio",
        bhk: 1,
        furnished: "Furnished",
        amenities: ["WiFi", "Power Backup", "Security"]
      },
      {
        title: "Spacious 3 BHK Family House with Garden and Parking",
        description: "Beautiful independent furnished house with private garage parking, pet-friendly lawn, modular kitchen, and spacious balconies for a peaceful family life.",
        price: 32000,
        location: "Whitefield, Bangalore",
        type: "House",
        bhk: 3,
        furnished: "Furnished",
        amenities: ["Parking", "Garden", "Pet-Friendly", "Balcony", "24/7 Security"]
      }
    ];

    for (const hp of highlightProps) {
      const owner = createdOwners[0];
      const searchText = buildPropertySearchText(hp);
      const embedding = await generateEmbedding(searchText);
      propertiesToCreate.push({
        ...hp,
        images: [images[0], images[1]],
        ownerId: owner._id,
        embedding,
        embeddingUpdatedAt: new Date(),
        coordinates: { lat: 30.7333, lng: 76.7794 }
      });
    }
    
    for (let i = 0; i < 22; i++) {
      const owner = createdOwners[Math.floor(Math.random() * createdOwners.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const furnished = furnishings[Math.floor(Math.random() * furnishings.length)];
      const bhk = Math.floor(Math.random() * 4) + 1; // 1 to 4
      
      const title = `${bhk} BHK ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${type} ${features[Math.floor(Math.random() * features.length)]}`;
      const price = Math.floor(Math.random() * 80) * 1000 + 10000; // 10k to 90k
      
      const numImages = Math.floor(Math.random() * 2) + 2;
      const propertyImages = [];
      for(let j=0; j<numImages; j++) {
        propertyImages.push(images[Math.floor(Math.random() * images.length)]);
      }

      // Pick 3-5 random amenities
      const propAmenities = allAmenities.slice().sort(() => 0.5 - Math.random()).slice(0, 4);

      const propData = {
        title,
        description: `This is a beautiful ${bhk} bedroom ${type} located in the heart of ${location}. It comes ${furnished.toLowerCase()} and is perfect for families or professionals looking for a premium lifestyle. Features ${propAmenities.join(", ")}, 24/7 security, and power backup.`,
        price,
        location,
        type,
        bhk,
        furnished,
        amenities: propAmenities,
        images: propertyImages,
        ownerId: owner._id,
        coordinates: {
          lat: 19.0760 + (Math.random() - 0.5) * 0.1,
          lng: 72.8777 + (Math.random() - 0.5) * 0.1
        }
      };

      const searchText = buildPropertySearchText(propData);
      const embedding = await generateEmbedding(searchText);

      propertiesToCreate.push({
        ...propData,
        embedding,
        embeddingUpdatedAt: new Date()
      });
    }

    await Property.insertMany(propertiesToCreate);
    console.log("Database successfully seeded with 5 Owners and 25 Properties (with vector embeddings)!");
    
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
