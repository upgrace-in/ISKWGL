"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import "../Darshan.css";


function dateToSlug(date) {
  return date
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/\s+/g, "-");
}


function slugToDate(slug) {
  return slug
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}


export default function DarshanDatePage({ params }) {

  const [darshans, setDarshans] = useState([]);
  const [currentDarshan, setCurrentDarshan] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {

    async function fetchDarshans() {

      try {

        const response =
          await fetch("/api/upload-darshan");

        if (!response.ok) {
          throw new Error(
            "Failed to fetch Darshan"
          );
        }

        const data = await response.json();

        setDarshans(data);


        /*
         * Find the Darshan corresponding
         * to the URL.
         *
         * Example:
         *
         * 26-september-2026
         *
         * becomes:
         *
         * 26 September 2026
         */

        const requestedDate =
          slugToDate(params.date);

        const found = data.find(
          (item) =>
            item.date.toLowerCase() ===
            requestedDate.toLowerCase()
        );

        if (!found) {

          setError(
            "Darshan not found for this date."
          );

        } else {

          setCurrentDarshan(found);

        }

      } catch (error) {

        console.error(
          "Failed to fetch Darshans:",
          error
        );

        setError(
          "Failed to load Darshan photos."
        );

      } finally {

        setLoading(false);

      }

    }


    fetchDarshans();

  }, [params.date]);


  /* ---------------------------------------
     LOADING
  --------------------------------------- */

  if (loading) {

    return (
      <div className="darshan-loading-page">

        <Loader2
          size={40}
          className="loading-spinner"
        />

        <span>
          Loading Darshan...
        </span>

      </div>
    );

  }


  /* ---------------------------------------
     ERROR
  --------------------------------------- */

  if (error || !currentDarshan) {

    return (
      <div className="darshan-not-found">

        <h2>
          {error || "Darshan not found"}
        </h2>

        <a href="/darshan">
          Go back to Daily Darshan
        </a>

      </div>
    );

  }


  /*
   * Find current Darshan position.
   */

  const currentIndex =
    darshans.findIndex(
      (item) =>
        item._id === currentDarshan._id
    );


  /*
   * Because API sorts:
   *
   * newest → oldest
   *
   * index + 1 = previous date
   * index - 1 = next date
   */

  const previousDarshan =
    currentIndex < darshans.length - 1
      ? darshans[currentIndex + 1]
      : null;


  const nextDarshan =
    currentIndex > 0
      ? darshans[currentIndex - 1]
      : null;


  return (
    <div className="darshan-page">


      {/* =====================================
          HEADER
      ====================================== */}

      <section className="darshan-header">

        <div className="darshan-header-inner">

          <h1>
            SRINGAR DARSHAN
          </h1>

          <div className="header-line"></div>

          <div className="breadcrumb">

            <a href="/darshan">
              Home
            </a>

            <ChevronRight size={15} />

            <span className="breadcrumb-current">
              {currentDarshan.date}
            </span>

          </div>

        </div>

      </section>


      {/* =====================================
          DETAIL CONTENT
      ====================================== */}

      <main className="darshan-detail-content">


        {/* DATE + NAVIGATION */}

        <div className="detail-top">


          {/* DATE */}

          <h2 className="detail-date">

            <span>-</span>{" "}

            {currentDarshan.date}

          </h2>


          {/* NAVIGATION */}

          <div className="date-navigation">


            {/* PREVIOUS */}

            {previousDarshan ? (

              <a
                href={`/darshan/${dateToSlug(
                  previousDarshan.date
                )}`}
                className="navigation-link"
              >

                <ChevronLeft size={18} />

                <span>
                  PREVIOUS
                </span>

              </a>

            ) : (

              <div className="navigation-placeholder"></div>

            )}


            {/* CURRENT DATE */}

            <span className="current-date">

              {currentDarshan.date}

            </span>


            {/* NEXT */}

            {nextDarshan ? (

              <a
                href={`/darshan/${dateToSlug(
                  nextDarshan.date
                )}`}
                className="navigation-link"
              >

                <span>
                  NEXT
                </span>

                <ChevronRight size={18} />

              </a>

            ) : (

              <div className="navigation-placeholder"></div>

            )}

          </div>

        </div>


        {/* =====================================
            PHOTOS
        ====================================== */}

        <div className="detail-image-grid">

          {currentDarshan.photos &&
            currentDarshan.photos.map(
              (photo, index) => (

                <div
                  className="detail-image-card"
                  key={
                    photo.url || index
                  }
                >

                  <img
                    src={photo.url}
                    alt={
                      photo.caption ||
                      `Sringar Darshan ${
                        currentDarshan.date
                      } ${index + 1}`
                    }
                  />

                </div>

              )
            )}

        </div>

      </main>

    </div>
  );
}