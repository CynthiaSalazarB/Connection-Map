import { useMapEvents } from 'react-leaflet';

function LocationSelector({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      // e.latlng contains { lat, lng }
      onLocationSelect(e.latlng);
    },
  });

  return null;
}

export default LocationSelector;