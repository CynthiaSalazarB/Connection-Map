import {MapContainer, TileLayer,CircleMarker, Tooltip, Marker} from 'react-leaflet'
import {useState, useEffect} from 'react'
import 'leaflet/dist/leaflet.css'
import LZString from 'lz-string'
import { toPng } from 'html-to-image';
import { Analytics } from "@vercel/analytics/react"
//import html2canvas from 'html2canvas'
import L from 'leaflet';

import LocationSelector from './LocationSelector'
import SearchControl from './SearchControl'
import AnimatedLine from './AnimatedLine'
import TravelingIcon from './TravelingIcon'
import AutoZoom from './AutoZoom'
import './App.css'

const staticLetterIcon = new L.DivIcon({
  className: 'letter-icon',
  html: '<div style="font-size: 30px; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3)); cursor: pointer;">💌</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

function App() {
  
  const [points, setPoints] = useState([]);
  const [message, setMessage]=useState("");
  const [isViewingMode, setIsViewingMode] = useState(false);
  const [letterArrived, setLetterArrived] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [fromName, setFromName]=useState("");
  const [toName, setToName] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(true);
  
  
  // FASE 1: LECTURA (Al cargar la página)

useEffect(()=>{

  const params = new URLSearchParams(window.location.search);
  const startParam = params.get('from');
  const endParam = params.get ('to');
  const msgParam = params.get('msg');
  const fnParam = params.get('fn');
  const tnParam = params.get('tn');

  const processData =()=>{

    if(startParam && endParam){
      setIsViewingMode(true);
      
      try{
        const [startLat, startLng] =startParam.split(',').map(Number);
        const [endLat, endLng]= endParam.split(',').map(Number);
        
        // Auto-zoom para que se vean los dos puntos  
        setPoints([{ lat: startLat, lng: startLng }, { lat: endLat, lng: endLng }]);   
      
      }catch(e){
        console.error("Error reading coords",e);
      }
    }

    if(fnParam) setFromName(decodeURIComponent(fnParam));
    if(tnParam) setToName(decodeURIComponent(tnParam));

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

if(fromName) params.set('fn', encodeURIComponent(fromName));
else params.delete('fn');

if(toName) params.set('tn', encodeURIComponent(toName));
else params.delete('tn');

if(message){
  const compressed = LZString.compressToEncodedURIComponent(message);
  params.set('msg', compressed);
}else{
  params.delete('msg')
}

// Actualizar la URL sin recargar
window.history.replaceState({}, '', `?${params.toString()}`);
},[points,message, isViewingMode,fromName, toName]);

const handleLocationSelect = (latlng)=>{
  // Si intentan hacer clic mientras ven un mensaje, reiniciamos todo a modo creador
  if (isViewingMode) {
      /* setIsViewingMode(false);
      setLetterArrived(false);
      setShowPopup(false);
      setMessage("");
      setPoints([latlng]);
      window.history.replaceState({}, '', window.location.pathname); */
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

  const handleDownloadImage = async () => {
    // 1. Ocultar la UI flotante
    const ui = document.querySelector('.ui-container');
    if (ui) ui.style.display = 'none';

    // 2. Encontrar el mapa
    const mapElement = document.querySelector('.leaflet-container');

    if (mapElement) {
      try {
        // Pequeña espera para asegurar que todo esté renderizado
        await new Promise(r => setTimeout(r, 1000));

        // 3. Generar la imagen con html-to-image
        const dataUrl = await toPng(mapElement, {
          quality: 0.95,
          cacheBust: true, // Ayuda a cargar imágenes externas (CORS)
          pixelRatio: 2, // Fuerza alta resolución (ayuda en iPhone)
          skipAutoScale:true,
          style:{
            transform: 'translate3d(0,0,0)',
          },
          filter: (node) => {
            // Excluir botones de zoom de la foto final para que se vea limpio
            if (node.classList && node.classList.contains('leaflet-control-zoom')) {
              return false;
            }
            return true;
          }
        });

        // 4. Descargar
        const link = document.createElement('a');
        link.download = `connection-map-${fromName || 'Origin'}-${toName || 'Destination'}.png`;
        link.href = dataUrl;
        link.click();

      } catch (err) {
        console.error("Error saving the image:", err);
        
        alert("There was an error saving your image");
      }
    }

    // 5. Mostrar la UI de nuevo
    if (ui) ui.style.display = 'flex';
  };


  //Descargar el mensaje
  const handleDownloadCard = async () => {
    // 1. Seleccionamos la tarjeta del mensaje
    const cardElement = document.querySelector('.popup-content');

    if (cardElement) {
      try {
        await new Promise(r => setTimeout(r, 200));

        const dataUrl = await toPng(cardElement, {
          quality: 0.95,
          cacheBust: true,
          backgroundColor: '#ffffff', // Asegura fondo blanco
          style: {
             transform: 'scale(1)', // Evita distorsiones raras
             boxShadow: 'none' // Quita la sombra para que se vea plano y limpio
          },
          filter: (node) => {
            // TRUCO: Ignorar todos los botones en la foto (la X, el botón de descargar, etc)
            // para que solo salga el texto y el icono.
            if (node.tagName === 'BUTTON') {
              return false;
            }
            return true;
          }
        });

        const link = document.createElement('a');
        link.download = `secret-letter-${fromName || 'Anonymous'}.png`;
        link.href = dataUrl;
        link.click();

      } catch (err) {
        console.error("Error saving the image:", err);
        alert("There was an error saving your image");
      }
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
          crossOrigin="anonymous"
        />

      {/* --- TU MARCA DE AGUA DEL MAPA --- */}
        <div className="watermark">
          @cynthiasalazarb {/* CAMBIA ESTO POR TU INSTAGRAM REAL */}
        </div>

        {/* COMPONENTES LÓGICOS */}
        <LocationSelector onLocationSelect={handleLocationSelect} />
        <AutoZoom points={points} />
        {/* Ocultar búsqueda si estamos viendo un mensaje para no distraer */}
        {!isViewingMode && <SearchControl onResult={handleLocationSelect}/>}

       {/* Visuals */}
       {points.map((point, index) => (
        <CircleMarker 
          key={index} center={point} radius={8} 
          pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.8 }}
        >
          {/* Lógica: Si es el punto 0 es "From", si es el 1 es "To" */}
          <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>
              {index === 0 ? (fromName || "Origin") : (toName || "Destination")}
            </span>
          </Tooltip>
        </CircleMarker>
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
                    //onClick={() => setShowPopup(true)}
                />
            )}

            {/* 2. CARTA EN DESTINO (Solo si YA llegó) - ESTE ES TU BOTÓN */}
            {isViewingMode && letterArrived && (
                <Marker 
                  position={points[1]} // En el destino
                  icon={staticLetterIcon}
                  eventHandlers={{
                    click: () => setIsNotificationOpen(true) // <--- AL CLICKEAR, ABRE LA CARTA
                  }}
                  zIndexOffset={1000}
                >
                </Marker>
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
                <strong>Step 1:</strong> Select two locations on the map.
            </div>
            ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                
              <div className="names-row">
                {/* Campo 1: FROM */}
                <div className="name-field">
                  <label className="name-label">From:</label>
                  <input 
                    className="name-input"
                    type="text" 
                    placeholder="Me" 
                    value={fromName} 
                    onChange={e => setFromName(e.target.value)}
                  />
                </div>

                {/* Campo 2: TO */}
                <div className="name-field">
                  <label className="name-label">To:</label>
                  <input 
                    className="name-input"
                    type="text" 
                    placeholder="You" 
                    value={toName} 
                    onChange={e => setToName(e.target.value)}
                  />
                </div>
                </div>
                
                <label className="input-label">Your secret message:</label>
                <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type here (e.g. 'Missing you...')"
                maxLength={600}
                className="message-input"
                />

                {/* Opcional: Botón de descargar también para el creador */}
                <button 
                onClick={() => {navigator.clipboard.writeText(window.location.href); alert("Link copiado 🔗");}}
                className="btn btn-primary"
                >
                Copy Link to Share 🔗
                </button>

                <button className="btn btn-secondary" onClick={handleDownloadImage}>
                  📸 Save Map Image
                </button>

            </div>
            )}
        </div>
      )}

      {/* CASO 2: MODO VISUALIZACIÓN (Botón de leer) */}
      {isViewingMode && letterArrived && !showPopup && isNotificationOpen && (
         <div className="ui-container">

          <button 
                onClick={() => setIsNotificationOpen(false)}
                style={{
                    position: 'absolute', top: '10px', right: '10px', 
                    background: 'transparent', border: 'none', 
                    fontSize: '16px', cursor: 'pointer', color: '#999'
                }}
            >
                ✕
            </button>

            <div className="view-mode-text">
                <h3>You have a Letter! 💌</h3>
                <p>It traveled a long way to find you.</p>
                <p>From: <strong>{fromName || "Someone"}</strong> <br/> To: <strong>{toName || "You"}</strong></p>
                 <button onClick={() => setShowPopup(true)} className="btn btn-primary">
                   ✨ Read Message ✨
                </button>

                <button className="btn btn-secondary" onClick={handleDownloadImage} style={{marginBottom:'10px'}}>
                    📸 Save Map Image
                 </button>

            </div>
         </div>
      )}

      {/* BOTÓN FLOTANTE PARA REABRIR (Solo si cerraron la notificación) */}
      {isViewingMode && letterArrived && !showPopup && !isNotificationOpen && (
          <button 
            onClick={() => setIsNotificationOpen(true)} // O setShowPopup(true) si prefieres abrir la carta directo
            style={{
                position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
                zIndex: 1000, background: 'white', padding: '10px 20px', borderRadius: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer',
                fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px'
            }}
          >
            💌 Open Letter
          </button>
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

                   {/* --- NUEVO BOTÓN DE DESCARGA --- */}
                   <button 
                    className="btn btn-secondary"
                    onClick={handleDownloadCard}
                   >
                    💾 Save Letter As Image
                   </button>
                    
                   <button 
                    onClick={() => {
                        // Reiniciar para que el usuario cree el suyo
                        setIsViewingMode(false); setLetterArrived(false); setShowPopup(false); setMessage(""); setFromName(""); setToName(""); setPoints([]);
                        window.history.replaceState({}, '', window.location.pathname);
                    }}
                    className="btn btn-ghost">
                      Send My Own Letter
                   </button>

                    {/* --- TU MARCA DE AGUA DE LA CARTA --- */}
                    <div className="watermark">
                      @cynthiasalazarb
                    </div>
                   
               </div>
           </div>
       )}

        <Analytics />

    </div>
  )
  
}

export default App
  
