import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const AutoZoom = ({ points }) => {
  const map = useMap(); // Accedemos a la instancia del mapa

  useEffect(() => {
    if (points.length === 2) {
      // Crear un cuadro (bounds) que encierre los dos puntos
      const bounds = L.latLngBounds([points[0], points[1]]);
      
      // Decirle al mapa que se ajuste a ese cuadro con un poco de margen (padding)
      map.fitBounds(bounds, { 
        padding: [100, 100], // 100px de margen para que no queden pegados al borde
        maxZoom: 15, // No acercarse demasiado si están muy cerca
        duration: 1 // Animación suave de 1 segundo
      });
    }
  }, [points, map]); // Se ejecuta cada vez que los puntos cambian

  return null; // Este componente no pinta nada, solo controla la cámara
};

export default AutoZoom;