import { useEffect, useRef, useState } from 'react';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import gsap from 'gsap';

//Icono de la Carta
const letterIcon = new L.DivIcon({
    className: 'letter-icon',
    html: '<div style= "font-size: 30px; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.3));">💌</div>',
    iconSize: [30,30],
    iconAnchor:[15,15]
});

const TravelingIcon = ({startPos, endPos, onArrival})=>{
    const [currentPos, setCurrentPos] = useState(startPos);
    const animationRef = useRef(null);

    useEffect(()=>{
        if(!startPos || !endPos) return;

        // 1. CALCULAR DISTANCIA REAL (En metros)
        const pointA = L.latLng(startPos);
        const pointB = L.latLng(endPos);
        const distanceInMeters = pointA.distanceTo(pointB);

        // 2. CALCULAR DURACIÓN DINÁMICA
        // Fórmula: Base (2s) + Distancia / Factor
        // Ajusta el '500000' para hacerla más rápida o lenta
        let dynamicDuration = 2 + (distanceInMeters / 500000); 

        // 3. LIMITAR (CLAMPING)
        // Mínimo 3 segundos (para que se note), Máximo 12 segundos (para no aburrir)
        if (dynamicDuration < 3) dynamicDuration = 3;
        if (dynamicDuration > 12) dynamicDuration = 12;

        console.log(`Distancia: ${Math.round(distanceInMeters/1000)}km, Tiempo: ${dynamicDuration.toFixed(1)}s`);


        const progress = {t:0};

        if(animationRef.current) animationRef.current.kill();


        animationRef.current = gsap.to(progress, {
            t:1,
            duration: dynamicDuration,
            ease: "power1.inOut",
            delay:0.5,
            onUpdate:()=>{
                const lat = startPos.lat + (endPos.lat - startPos.lat)* progress.t;
                const lng = startPos.lng + (endPos.lng - startPos.lng)* progress.t;
                
                setCurrentPos({lat,lng});
            },

            onComplete:()=>{
                if(onArrival) onArrival();
            }
        });

        return () => {
             if (animationRef.current) animationRef.current.kill();
        }

    },[startPos, endPos, onArrival]);
    return <Marker position={currentPos} icon={letterIcon} zIndexOffset={1000} />;
};
export default TravelingIcon;