# Fix for GeoJSON Location Error

## Problem
MongoDB error when uploading payment receipts:
```
Can't extract geo keys: unknown GeoJSON type: { coordinates: [ 72.8777, 19.07 ] }
```

## Root Cause
Some properties in the database have `location.coordinates` but are missing the `location.type: 'Point'` field, which is required for proper GeoJSON format.

## Solution

### 1. Fixed Property Controller
Updated `propertyController.js` to ensure proper GeoJSON format:

**In createProperty:**
```javascript
// Ensure proper GeoJSON format for location
if (propertyData.location && propertyData.location.coordinates) {
  propertyData.location = {
    type: 'Point',
    coordinates: propertyData.location.coordinates
  };
}
```

**In updateProperty:**
```javascript
// Ensure proper GeoJSON format for location if being updated
if (req.body.location && req.body.location.coordinates) {
  req.body.location = {
    type: 'Point',
    coordinates: req.body.location.coordinates
  };
}
```

### 2. Fix Existing Properties in Database

**Option A: Using MongoDB Compass or mongosh**

1. Open MongoDB Compass or mongosh
2. Connect to your database
3. Run this command:

```javascript
db.properties.updateMany(
  {
    "location.coordinates": { $exists: true },
    "location.type": { $exists: false }
  },
  {
    $set: { "location.type": "Point" }
  }
);
```

**Option B: Using the provided script**

Run the script located at:
```
server/migrations/fix-locations.mongodb
```

### 3. Verify the Fix

After running the update, verify with:

```javascript
db.properties.find({ "location.coordinates": { $exists: true } }).forEach(function(doc) {
  print("Property:", doc.title, "- Location type:", doc.location.type);
});
```

All properties should now have `location.type: "Point"`.

## Testing

1. Try uploading a payment receipt as a tenant
2. The error should no longer occur
3. All future properties will have proper GeoJSON format automatically

## Files Modified

- `server/controllers/propertyController.js` - Added GeoJSON validation
- `server/migrations/fix-locations.mongodb` - Database fix script
