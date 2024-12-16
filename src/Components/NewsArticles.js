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
            <section class="campaign-news">
                <div class="container">
                    <div class="row">
                        <div class="col-lg-8 mx-auto">
                            <div class="dual-heading center">
                                <h2>ISKCON <span>In The news</span></h2>
                            </div>
                        </div>
                    </div>
                    <div class="row mt-5">
                        <div class="col-lg-10 mx-auto">
                            <div class="live-video-wrap">
                                <iframe src="https://www.youtube.com/embed/tR8Zl7XhDU0" allowFullScreen=""></iframe>
                                <div class="news-details">
                                    <div class="news-details-wrap">
                                        <h4>ISKCON lends a helping hand to the needy</h4>
                                        <p>ISKCON lends a helping hand to the needy</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="compaign-articles" id="articles">
                <div class="container">
                    <div class="video-wrap">
                        <div class="row my-5">
                            {/* <div class="owl-carousel owl-carousel2"> */}
                            <OwlCarousel
                                className="owl-theme"
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
                                margin={10}>
                                <div class="video-holder vh2 vh3 item">
                                    <a data-fancybox="video" href="#">
                                        <figure class="mb-0">
                                            <img src="/index_files/campaignArticles-166281121940454146.webp" alt="" />
                                        </figure>
                                    </a>
                                </div>

                                <div class="video-holder vh2 vh3 item">
                                    <a data-fancybox="video" href="#">
                                        <figure class="mb-0">
                                            <img src="/index_files/campaignArticles-166281121940556922.webp" alt="" />
                                        </figure>
                                    </a>
                                </div>

                                <div class="video-holder vh2 vh3 item">
                                    <a data-fancybox="video" href="#">
                                        <figure class="mb-0">
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