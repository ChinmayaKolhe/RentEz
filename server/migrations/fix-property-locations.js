import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Fix location GeoJSON format
const fixPropertyLocations = async () => {
  try {
    await connectDB();

    const Property = mongoose.model('Property', new mongoose.Schema({}, { strict: false }));

    // Find all properties with location but missing type field
    const properties = await Property.find({
      'location.coordinates': { $exists: true },
      'location.type': { $exists: false }
    });

    console.log(`\n📋 Found ${properties.length} properties to fix\n`);

    let fixed = 0;
    for (const property of properties) {
      try {
        await Property.updateOne(
          { _id: property._id },
          {
            $set: {
              'location.type': 'Point'
            }
          }
        );
        console.log(`✅ Fixed property: ${property.title} (${property._id})`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing property ${property._id}:`, error.message);
      }
    }

    console.log(`\n✅ Migration complete! Fixed ${fixed} out of ${properties.length} properties\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration Error:', error);
    process.exit(1);
  }
};

// Run migration
fixPropertyLocations();
