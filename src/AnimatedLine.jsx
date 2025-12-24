import{useEffect,useRef} from 'react';
import {Polyline} from 'react-leaflet';
import gsap from 'gsap';

const AnimatedLine = ({positions})=>{

    const lineRef = useRef (null);

    useEffect(()=>{
        const layer = lineRef.current;

        // Validar
        if(!layer || !layer._path) {
            return;
        }

        const path = layer._path; //Acceder al elemento <path> del DOM real
        const length = path.getTotalLength(); //calculamos que tan larga es la linea en pixeles

        //Start animation
        //Inicial state (invisible)
        gsap.set(path, {
            strokeDashArray: length,
            strokeDashoffset: length, 
            opacity:0
        });

        gsap.to(path,{
            strokeDashoffset: 0,
            opacity:1,
            duration:2.5,
            ease:"power2.out",
            delay: 0.2 
        });

    }, [positions]); //Every time positions change

    return(
        <Polyline
            ref={lineRef}
            positions = {positions}
            pathOptions = {{
                color:'#ff0000',
                weight:4,
                lineCap:'round',
                lineJoin: 'round'
            }}
        />
    );
};
export default AnimatedLine;

