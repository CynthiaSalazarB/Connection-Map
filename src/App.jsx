import {MapContainer, TileLayer,CircleMarker, Polyline} from 'react-leaflet'
import {useState, useEffect} from 'react'
import 'leaflet/dist/leaflet.css'
import LZString from 'lz-string'
//import L from 'leaflet';

import LocationSelector from './LocationSelector'
import SearchControl from './SearchControl'
import AnimatedLine from './AnimatedLine'
import TravelingIcon from './TravelingIcon'
import AutoZoom from './AutoZoom'
import './App.css'

function App() {
  
  const [points, setPoints] = useState([]);
  const [message, setMessage]=useState("");
  const [isViewingMode, setIsViewingMode] = useState(false);
  const [letterArrived, setLetterArrived] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // FASE 1: LECTURA (Al cargar la página)

useEffect(()=>{

  const params = new URLSearchParams(window.location.search);
  const startParam = params.get('from');
  const endParam = params.get ('to');
  const msgParam = params.get('msg');

  const processData =()=>{

    if(startParam && endParam){
      setIsViewingMode(true);
      
      try{
        const [startLat, startLng] =startParam.split(',').map(Number);
        const [endLat, endLng]= endParam.split(',').map(Number);
        
        // Auto-zoom para que se vean los dos puntos  
        setPoints([{ lat: startLat, lng: startLng }, { lat: endLat, lng: endLng }]);   
      /* if (mapRef.current) {
        const bounds = L.latLngBounds([loadedPoints[0], loadedPoints[1]]);
        mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      } */
      }catch(e){
        console.error("Error reading coords",e);
      }
    }
    if(msgParam){
        const decompressed = LZString.decompressFromEncodedURIComponent(msgParam);
        if(decompressed){
          setMessage(decompressed);
        }
      }
  }
  processData();

},[]);



// FASE 2: ESCRITURA (Solo si NO estamos en modo visualización)

useEffect(()=>{
if (isViewingMode || points.length === 0) return;

const params = new URLSearchParams(window.location.search);

if(points[0]){
  params.set('from', `${points[0].lat.toFixed(4)},${points[0].lng.toFixed(4)}`)
}

if(points[1]){
  params.set('to', `${points[1].lat.toFixed(4)},${points[1].lng.toFixed(4)}`)
}

if(message){
  const compressed = LZString.compressToEncodedURIComponent(message);
  params.set('msg', compressed);
}else{
  params.delete('msg')
}

// Actualizar la URL sin recargar
window.history.replaceState({}, '', `?${params.toString()}`);
},[points,message, isViewingMode]);


const handleLocationSelect = (latlng)=>{
  // Si intentan hacer clic mientras ven un mensaje, reiniciamos todo a modo creador
  if (isViewingMode) {
      setIsViewingMode(false);
      setLetterArrived(false);
      setShowPopup(false);
      setMessage("");
      setPoints([latlng]);
      window.history.replaceState({}, '', window.location.pathname);
      return;
   }
    
  if(points.length >=2){
     setPoints([latlng]);
    setMessage("");
     //window.history.replaceState({},'',WebTransportBidirectionalStream.location.pathname);
   }else{
     setPoints([...points,latlng]);
   }
  };

 return (
    <div className="app-container">
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
        {/* COMPONENTES LÓGICOS */}
        <LocationSelector onLocationSelect={handleLocationSelect} />
        <AutoZoom points={points} />
        {/* Ocultar búsqueda si estamos viendo un mensaje para no distraer */}
        {!isViewingMode && <SearchControl onResult={handleLocationSelect}/>}

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
          /* { *//* <Polyline 
            positions={points} 
            pathOptions={{ color: 'red', weight: 4, dashArray: '10, 10' }} 
          /> *//* } */

          <>
            <AnimatedLine positions={points} />
            
            {/* Solo mostrar la carta viajera si estamos en MODO VISUALIZACIÓN */}
            {isViewingMode && !letterArrived && (
                <TravelingIcon 
                    startPos={points[0]} 
                    endPos={points[1]} 
                    onArrival={() => setLetterArrived(true)} // Cuando llegue, cambiar estado
                />
            )}
          </>
        )}
      </MapContainer>

      {/* UI FLOTANTE: CAMBIA SEGÚN EL MODO */}
      
      {/* CASO 1: MODO CREADOR (Input de texto) */}
      {!isViewingMode && (
        <div className="ui-container">
            {points.length < 2 ? (
            <div className="step-text">
                <strong>Paso 1:</strong> Selecciona origen y destino en el mapa.
            </div>
            ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <label className="input-label">Tu mensaje secreto:</label>
                <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe aquí (ej. 'Te extraño desde aquí...')"
                maxLength={600}
                className="message-input"
                />
                <button 
                onClick={() => {navigator.clipboard.writeText(window.location.href); alert("Link copiado 🔗");}}
                className="btn btn-secondary"
                >
                Copiar Link para Compartir 🔗
                </button>
            </div>
            )}
        </div>
      )}

      {/* CASO 2: MODO VISUALIZACIÓN (Botón de leer) */}
      {isViewingMode && letterArrived && !showPopup && (
         <div className="ui-container">
            <div className="view-mode-text">
                <h3>¡Tienes una carta! 💌</h3>
                <p>Ha viajado desde lejos para ti.</p>
                 <button onClick={() => setShowPopup(true)} className="btn btn-primary">
                    Leer Mensaje ✨
                </button>
            </div>
         </div>
      )}

       {/* POPUP FINAL CON EL MENSAJE */}
       {showPopup && (
           <div className="popup-overlay">
               <div className="popup-content">
                    {/* Botón cerrar */}
                   <button 
                    onClick={() => setShowPopup(false)}
                    className="close-btn">
                    ✕
                   </button>

                   <div className="popup-icon">💌</div>
                   <p className="popup-message">
                       {message}
                   </p>
                    
                   <button 
                    onClick={() => {
                        // Reiniciar para que el usuario cree el suyo
                        setIsViewingMode(false); setLetterArrived(false); setShowPopup(false); setMessage(""); setPoints([]);
                        window.history.replaceState({}, '', window.location.pathname);
                    }}
                    className="btn btn-ghost">
                    Crear mi propio mapa
                   </button>
               </div>
           </div>
       )}

    </div>
  )
}

export default App
  
