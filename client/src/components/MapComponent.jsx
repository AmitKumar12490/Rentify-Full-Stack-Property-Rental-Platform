import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = ({ lat, lng, title }) => {
  const position = [lat || 28.6139, lng || 77.2090]; // default to Delhi

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-sm border z-0">
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} className="h-full w-full relative z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {(lat && lng) && (
          <Marker position={position}>
            <Popup>{title || 'Property Location'}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
