import {MapContainer, TileLayer,Marker,Popup} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'//import 'leaflet/dist/leaflet.css'

function App() {
  //Coordenadas iniciales
  const position = [43.6548, -79.3832]

 return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        {/* Capa visual del mapa (OpenStreetMap es gratis) */}
      {/* Mapa base minimalista (CartoDB Voyager - se ve más limpio) */}
        <TileLayer
          attribution='&copy; OpenStreetMap & CartoDB'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {/* Un marcador de prueba */}
        <Marker position={position}>
          <Popup>
            Aqui empieza el Hilo Rojo / Start
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )

}

export default App
  
