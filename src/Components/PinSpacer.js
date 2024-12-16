'use client'

import Carousel from 'react-bootstrap/Carousel';

export default function PinSpacer() {

    // RATH YATRA ARRAY
    // const imageArray = ["/headerImages/RY11.png","/headerImages/RY13.png", "/headerImages/RY14.png", "/headerImages/abode-inspiration-min.png", "/headerImages/Annadanam.png", "/headerImages/Chant-and-Be-happy-min.png", "/headerImages/Destination-for-Peace-min.png", "/headerImages/Sunday-Program-min.png", "/headerImages/Prahlad-School-min.png"]

    // IMAGE ARRAY
    const imageArray = ["headerImages/temple_renovation_1.png", "headerImages/temple_renovation_2.png", "headerImages/temple_renovation_3.png", "headerImages/temple_renovation_4.png", "headerImages/volunteer.png", "/headerImages/Chant-and-Be-happy-min.png", "/headerImages/Sunday-Program-min.png"]

    return (

        <Carousel variant="dark" className='pin-spacer' interval={5000} fade>
        {imageArray.map((src, index) => (
             <Carousel.Item key={index}>
             <div className="CarouselContainer">
                 {src === "/headerImages/janmashtami-main.png" ? (
                     <a href="/janmashtami">
                         <img src={src} alt={`Slide ${index + 1}`} className="d-block w-80 pin-spacer__image" />
                     </a>
                 ) : src === "/headerImages/annadanam-janmashtami.png" ? (
                     <a href="/#annadan">
                         <img src={src} alt={`Slide ${index + 1}`} className="d-block w-80 pin-spacer__image" />
                     </a>
                 ) : (
                     <img src={src} alt={`Slide ${index + 1}`} className="d-block w-80 pin-spacer__image" />
                 )}
             </div>
         </Carousel.Item>
        ))}
        </Carousel>
    )
}