"use client"
import { useEffect } from "react";
import Header from "@/Components/Header";
import Mission from "@/Components/Mission";
import Founder from "@/Components/Founder";
import Footer from "@/Components/Footer";
import Floating from "@/Components/Floating";
import DonateCategories from "@/Components/DonateCategories";
import DirectDonation from "@/Components/DirectDonation";
import NewsArticles from "@/Components/NewsArticles";
import Welcome from "@/Components/Welcome";
import PinSpacer from "@/Components/PinSpacer";
import Gallery from "@/Components/Gallery";
import VideoComponent from "@/Components/VideoComponent";
import Temple from "@/Components/Temple";
import ReactGA from "react-ga4";
import BirthdayHandler from "@/Components/BirthdayHandler"

function Home() {

  useEffect(() => {
    ReactGA.initialize("G-MWSM61X0BD", { debug: true });
    ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
  }, []);

  return <>
    <Header />
    <PinSpacer />
    <BirthdayHandler />
    <Welcome />
    <Gallery />
    <Mission />
    <Founder />
    <VideoComponent />
    <Temple />
    <DirectDonation />
    <DonateCategories />
    <NewsArticles />
    <Floating />
    <Footer />
  </>

}

export default Home;
