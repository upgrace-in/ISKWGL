"use client"
import React from 'react';

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

export default function NewsArticles() {

    return (
        <>
            <section className="campaign-news">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-8 mx-auto">
                            <div className="dual-heading center">
                                <h2>ISKCON <span>In The news</span></h2>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-lg-10 mx-auto">
                            <div className="live-video-wrap">
                                <iframe src="https://www.youtube.com/embed/tR8Zl7XhDU0" allowFullScreen=""></iframe>
                                <div className="news-details">
                                    <div className="news-details-wrap">
                                        <h4>ISKCON lends a helping hand to the needy</h4>
                                        <p>ISKCON lends a helping hand to the needy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="compaign-articles" id="articles">
                <div className="container">
                    <div className="video-wrap">
                        <div className="row my-5">
                            {/* <div className="owl-carousel owl-carousel2"> */}
                            <OwlCarousel
                                className="owl-theme"
                                loop
                                nav
                                autoplay={true}
                                // autoplayHoverPause={true}
                                autoplayTimeout={5000}
                                autoplaySpeed={800}
                                smartSpeed={800}
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
                                margin={10}>
                                <div className="video-holder vh2 vh3 item">
                                    <a data-fancybox="video" href="#">
                                        <figure className="mb-0">
                                            <img src="/index_files/campaignArticles-166281121940454146.webp" alt="" />
                                        </figure>
                                    </a>
                                </div>

                                <div className="video-holder vh2 vh3 item">
                                    <a data-fancybox="video" href="#">
                                        <figure className="mb-0">
                                            <img src="/index_files/campaignArticles-166281121940556922.webp" alt="" />
                                        </figure>
                                    </a>
                                </div>

                                <div className="video-holder vh2 vh3 item">
                                    <a data-fancybox="video" href="#">
                                        <figure className="mb-0">
                                            <img src="/index_files/campaignArticles-166281121940610331.webp" alt="" />
                                        </figure>
                                    </a>
                                </div>
                            </OwlCarousel>
                        </div>
                    </div>
                </div>

            </section>
        </>
    )
}