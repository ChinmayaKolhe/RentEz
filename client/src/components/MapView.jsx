import { MapPin } from 'lucide-react';

const MapView = ({ longitude, latitude, zoom = 14 }) => {
  // Simple static map placeholder using OpenStreetMap
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg" style={{ minHeight: '400px' }}>
      <iframe
        width="100%"
        height="400"
        frameBorder="0"
        scrolling="no"
        marginHeight="0"
        marginWidth="0"
        src={mapUrl}
        title="Property Location Map"
      />
      <div className="bg-white p-3 flex items-center justify-center text-gray-600 text-sm">
        <MapPin className="h-4 w-4 mr-2" />
        <span>Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</span>
      </div>
    </div>
  );
};

export default MapView;
