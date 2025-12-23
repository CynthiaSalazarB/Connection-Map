import {useEffect} from 'react';
import {useMap} from 'react-leaflet';
import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css'; // Estilos de la barra

const SearchControl = ({ onResult }) => {
  const map = useMap(); // Accedemos a la instancia del mapa

  useEffect(() => {
        const provider = new OpenStreetMapProvider();

        const searchControl = new GeoSearchControl({
        provider: provider,
        style: 'button', // 'bar' para barra de búsqueda, 'button' para solo icono
        showMarker: false, // No queremos que ponga su propio marcador, usaremos los nuestros
        keepResult: true,
        });

        map.addControl(searchControl);

        map.on('geosearch/showlocation', (result)=>{

            if(onResult){
                onResult({lat: result.location.y, lng: result.location.x});
            }
        });

        return ()=>map.removeControl(searchControl);
        
    }, [map,onResult]);
    return null;
};

export default SearchControl;
