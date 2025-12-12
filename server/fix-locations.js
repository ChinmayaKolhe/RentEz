import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixPropertyLocations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get the properties collection
    const db = mongoose.connection.db;
    const propertiesCollection = db.collection('properties');

    // Find properties with coordinates but no type
    const result = await propertiesCollection.updateMany(
      {
        'location.coordinates': { $exists: true },
        'location.type': { $exists: false }
      },
      {
        $set: { 'location.type': 'Point' }
      }
    );

    console.log(`\n✅ Fixed ${result.modifiedCount} properties`);
    console.log(`   Matched: ${result.matchedCount}`);
    console.log(`   Modified: ${result.modifiedCount}\n`);

    // Verify the fix
    const properties = await propertiesCollection.find({
      'location.coordinates': { $exists: true }
    }).toArray();

    console.log('📋 Verification:');
    properties.forEach(prop => {
      console.log(`   - ${prop.title}: type = ${prop.location?.type || 'MISSING'}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixPropertyLocations();
