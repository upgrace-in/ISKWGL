"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import "./Darshan.css";
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import DirectDonation from "@/Components/Direct_donation_and_80G"

function dateToSlug(date) {
  return date
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-");
}

export default function DarshanPage() {
  const [darshans, setDarshans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
      const [navOpen, setNavOpen] = useState(false)
  // const darshans = [
  //   {
  //     mainImage : "/images/cow.png",
  //     date : "1 January 2024",
  //   },
  //   {
  //     mainImage : "/images/cow.png",
  //     date : "1 January 2024",
  //   },
  //   {
  //     mainImage : "/images/cow.png",
  //     date : "1 January 2024",
  //   },
  //   {
  //     mainImage : "/images/cow.png",
  //     date : "1 January 2024",
  //   },
  //   {
  //     mainImage : "/images/cow.png",
  //     date : "1 January 2024",
  //   },
  //   {
  //     mainImage : "/images/cow.png",
  //     date : "1 January 2024",
  //   }
  // ]

  useEffect(() => {
    async function fetchDarshans() {
      try {
        const response = await fetch("/api/upload-darshan");
        console.log(response);

        if (!response.ok) {
          throw new Error("Failed to fetch Darshan");
        }

        const data = await response.json();

        setDarshans(data);
      } catch (error) {
        console.error("Failed to fetch Darshans:", error);
        setError("Failed to load Darshan photos.");
      } finally {
        setLoading(false);
      }
    }

    fetchDarshans();
  }, []);

  return (
    <>
    
      <Header handleNav={() => setNavOpen(!navOpen)} />
      <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
      <div className="darshan-page">

        {/* HEADER */}
        <section className="darshan-header">
          <div className="darshan-header-inner">

            <h1>DAILY DARSHAN</h1>

            <div className="header-line"></div>

            <div className="breadcrumb">
              <a href="/">Home</a>

              <ChevronRight size={15} />

              <span className="breadcrumb-current">
                Daily Darshan
              </span>
            </div>

          </div>
        </section>


        {/* CONTENT */}
        <main className="darshan-content">


          {/* TITLE */}
          <h2 className="section-title">
            Sringar Darshan
          </h2>


          {/* LOADING */}
          {loading && (
            <div className="darshan-loading">

              <Loader2
                size={35}
                className="loading-spinner"
              />

              <span>
                Loading Darshan...
              </span>

            </div>
          )}


          {/* ERROR */}
          {!loading && error && (
            <div className="darshan-error">
              {error}
            </div>
          )}


          {/* CARDS */}
          {!error && !loading && (
            <div className="darshan-grid">

              {darshans.map((darshan) => (

                <div
                  className="darshan-card"
                  key={darshan._id}
                >

                  {/* MAIN IMAGE */}
                  <div className="darshan-image-wrapper">

                    <img
                      src={darshan.mainImage}
                      alt={`Sringar Darshan ${darshan.date}`}
                      className="darshan-card-image"
                    />

                  </div>


                  {/* CARD FOOTER */}
                  <div className="darshan-card-footer">

                    <div className="darshan-date">
                      {darshan.date}
                    </div>


                    <a
                      href={`/Daily-Darshan/${dateToSlug(
                        darshan.date
                      )}`}
                      className="view-all-button"
                    >
                      View All
                    </a>

                  </div>

                </div>

              ))}

            </div>
          )}

        </main>

      </div>
      <Floating />
      
      <Foooter />
    </>
  );
}