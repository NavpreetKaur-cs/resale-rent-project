const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    const db = mongoose.connection.db;
    
    // List all indexes using the correct method for mongoose 9.x
    const indexList = await db.collection("users").listIndexes().toArray();
    console.log("Current indexes:");
    indexList.forEach((index) => {
      console.log("  - " + index.name + ":", JSON.stringify(index));
    });
    
    // Drop all indexes except _id
    for (const indexInfo of indexList) {
      if (indexInfo.name !== "_id_") {
        try {
          await db.collection("users").dropIndex(indexInfo.name);
          console.log("Dropped index: " + indexInfo.name);
        } catch (err) {
          console.log("Could not drop index " + indexInfo.name + ": " + err.message);
        }
      }
    }
    
    console.log("All problematic indexes removed");
    
    // Recreate the email unique index
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    console.log("Recreated email unique index");
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

connectDB();
