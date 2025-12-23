import {MapContainer, TileLayer,CircleMarker, Polyline} from 'react-leaflet'
import {useState} from 'react'
import 'leaflet/dist/leaflet.css'
import LocationSelector from './LocationSelector'
import SearchControl from './SearchControl'

function App() {
  
  const [points, setPoints] = useState([]);
  const handleLocationSelect = (latlng)=>{
    if(points.length >=2){
      setPoints([latlng]);
    }else{
      setPoints([...points,latlng]);
    }
  };

 return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer 
        center={[43.6407, -79.3871]} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
      {/* Mapa base minimalista (CartoDB Voyager. se ve más limpio) */}
        <TileLayer
          attribution='&copy; OpenStreetMap & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {/* Para seleccionar directamente en el mapa */}
        <LocationSelector onLocationSelect={handleLocationSelect} />
        
        {/* Barra de busqueda */}
        <SearchControl onResult={handleLocationSelect}/>

       {/* Visuals */}
        {points.map((point, index) => (
          <CircleMarker 
            key={index} 
            center={point} 
            radius={8} 
            pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.8 }}
          />
        ))}

        {points.length === 2 && (
          <Polyline 
            positions={points} 
            pathOptions={{ color: 'red', weight: 4, dashArray: '10, 10' }} 
          />
        )}
      </MapContainer>
    </div>
  )

}

export default App
  
