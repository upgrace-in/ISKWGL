"use client"
import React, { useEffect, useState } from 'react';

var $ = require("jquery");
if (typeof window !== "undefined") {
    window.$ = window.jQuery = require("jquery");
}
import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import dynamic from "next/dynamic";

const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
    ssr: false,
});

import GalleryIMGs from '@/Helpers/GalleryIMGs'

export default function Gallery() {

    const [galleryIMGs, setGalleryIMGs] = useState([])
    const max = 35
    useEffect(() => {
        let arr = []
        for (let i = 0; i < 43; i++) {
            if (i !== 0 && i !== 19)
                arr.push({ src: `${i + 1}.jpg` })
        }
        setGalleryIMGs(arr)
    }, [])

    return (
        <section class="yt-links-sec" id="gallery">
            <div class="container">
                <div class="row">
                    <div class="col-lg-8 mx-auto">
                        <div class="heading">
                            <h2 class="head-1">GALLERY</h2>
                            {/* <!-- <p class="b-line">
                                Deep dive into the spiritual oasis that is the Hare Krishna
                                Movement by way of these beautiful short-films of under
                                90-seconds duration. Discover the bliss of Bhakti...
                            </p> --> */}
                        </div>
                    </div>
                </div>
                <div class="video-wrap">
                    <div class="row my-5">
                        <OwlCarousel className="owl-theme"
                            loop
                            nav
                            autoplay={true}
                            // autoplayHoverPause={true}
                            autoplayTimeout={2000}
                            responsive={{
                                0: {
                                    items: 1,
                                    nav: true,
                                },
                                600: {
                                    items: 3,
                                    nav: false,
                                },
                                1000: {
                                    items: 3,
                                    nav: true,
                                    loop: true,
                                },
                            }}
                            margin={10} >

                            <GalleryIMGs data={galleryIMGs} />

                        </OwlCarousel>
                    </div>
                </div>
            </div>
        </section >
    )
}