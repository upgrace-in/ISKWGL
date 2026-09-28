"use client";

import React, { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
} from "lucide-react";

import "../Darshan.css";
import Header from "../../../Components/Header"
import SideNav from "../../../Components/SideNav"
import Foooter from "../../../Components/footter"
import Floating from "@/Components/Floating";

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
  const [navOpen, setNavOpen] = useState(false)

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    async function fetchDarshans() {
      try {
        const response = await fetch("/api/upload-darshan");

        if (!response.ok) {
          throw new Error("Failed to fetch Darshan");
        }

        const data = await response.json();
        setDarshans(data);

        const requestedDate = slugToDate(params.date);
        const found = data.find(
          (item) =>
            item.date.toLowerCase() === requestedDate.toLowerCase()
        );

        if (!found) {
          setError("Darshan not found for this date.");
        } else {
          setCurrentDarshan(found);
        }
      } catch (error) {
        console.error("Failed to fetch Darshans:", error);
        setError("Failed to load Darshan photos.");
      } finally {
        setLoading(false);
      }
    }

    fetchDarshans();
  }, [params.date]);

  // Handle keyboard navigation for Lightbox
  useEffect(() => {
    function handleKeyDown(e) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") handlePrevPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, currentDarshan]);

  const handlePrevPhoto = () => {
    if (!currentDarshan?.photos) return;
    setIsZoomed(false);
    setLightboxIndex((prev) =>
      prev > 0 ? prev - 1 : currentDarshan.photos.length - 1
    );
  };

  const handleNextPhoto = () => {
    if (!currentDarshan?.photos) return;
    setIsZoomed(false);
    setLightboxIndex((prev) =>
      prev < currentDarshan.photos.length - 1 ? prev + 1 : 0
    );
  };

  /* ---------------------------------------
     LOADING
  --------------------------------------- */

  if (loading) {
    return (
      <div className="darshan-loading-page">
        <Loader2 size={40} className="loading-spinner" />
        <span>Loading Darshan...</span>
      </div>
    );
  }

  /* ---------------------------------------
     ERROR
  --------------------------------------- */

  if (error || !currentDarshan) {
    return (
      <div className="darshan-not-found">
        <h2>{error || "Darshan not found"}</h2>
        <a href="/Daily-Darshan">Go back to Daily Darshan</a>
      </div>
    );
  }

  const currentIndex = darshans.findIndex(
    (item) => item._id === currentDarshan._id
  );

  const previousDarshan =
    currentIndex < darshans.length - 1 ? darshans[currentIndex + 1] : null;

  const nextDarshan = currentIndex > 0 ? darshans[currentIndex - 1] : null;

  return (
    <>
    
      <Header handleNav={() => setNavOpen(!navOpen)} />
      <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
      <div className="darshan-page">
        {/* =====================================
            HEADER
        ====================================== */}
        <section className="darshan-header">
          <div className="darshan-header-inner">
            <h1>SRINGAR DARSHAN</h1>
            <div className="header-line"></div>
            <div className="breadcrumb">
              <a href="/">Home</a>
              <ChevronRight size={15} />
              <a href="/Daily-Darshan">Daily Darshan</a>
              <ChevronRight size={15} />
              <span className="breadcrumb-current">{currentDarshan.date}</span>
            </div>
          </div>
        </section>

        {/* =====================================
            DETAIL CONTENT
        ====================================== */}
        <main className="darshan-detail-content">
          {/* DATE + NAVIGATION */}
          <div className="detail-top">
            <h2 className="detail-date">
              <span>-</span> {currentDarshan.date}
            </h2>

            {/* NAVIGATION */}
            <div className="date-navigation">
              {previousDarshan ? (
                <a
                  href={`/Daily-Darshan/${dateToSlug(previousDarshan.date)}`}
                  className="navigation-link"
                >
                  <ChevronLeft size={18} />
                  <span>PREVIOUS</span>
                </a>
              ) : (
                <div className="navigation-placeholder"></div>
              )}

              {nextDarshan ? (
                <a
                  href={`/Daily-Darshan/${dateToSlug(nextDarshan.date)}`}
                  className="navigation-link"
                >
                  <span>NEXT</span>
                  <ChevronRight size={18} />
                </a>
              ) : (
                <div className="navigation-placeholder"></div>
              )}
            </div>
          </div>

          {/* =====================================
              PHOTOS GRID
          ====================================== */}
          <div className="detail-image-grid">
            {currentDarshan.photos &&
              currentDarshan.photos.map((photo, index) => (
                <div
                  className="detail-image-card"
                  key={photo.url || index}
                  onClick={() => setLightboxIndex(index)}
                >
                  <img
                    src={photo.url}
                    alt={
                      photo.caption ||
                      `Sringar Darshan ${currentDarshan.date} ${index + 1}`
                    }
                  />
                </div>
              ))}
          </div>
        </main>

        {/* =====================================
            LIGHTBOX MODAL
        ====================================== */}
        {lightboxIndex !== null && currentDarshan.photos && (
          <div className="lightbox-overlay">
            {/* Top Bar Controls */}
            <div className="lightbox-top-bar">
              <span className="lightbox-counter">
                {lightboxIndex + 1} / {currentDarshan.photos.length}
              </span>
              <div className="lightbox-actions">
                <button
                  onClick={() => setIsZoomed(!isZoomed)}
                  title="Zoom Toggle"
                >
                  {isZoomed ? <ZoomOut size={20} /> : <ZoomIn size={20} />}
                </button>
                <a
                  href={currentDarshan.photos[lightboxIndex].url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  title="Download"
                >
                  <Download size={20} />
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        url: currentDarshan.photos[lightboxIndex].url,
                      });
                    }
                  }}
                  title="Share"
                >
                  <Share2 size={20} />
                </button>
                <button
                  className="lightbox-close"
                  onClick={() => {
                    setLightboxIndex(null);
                    setIsZoomed(false);
                  }}
                  title="Close"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Main Display Area */}
            <div className="lightbox-main-viewport">
              <button
                className="lightbox-nav-btn left"
                onClick={handlePrevPhoto}
              >
                <ChevronLeft size={36} />
              </button>

              <div
                className={`lightbox-image-container ${
                  isZoomed ? "zoomed" : ""
                }`}
              >
                <img
                  src={currentDarshan.photos[lightboxIndex].url}
                  alt="Enlarged Darshan"
                />
              </div>

              <button
                className="lightbox-nav-btn right"
                onClick={handleNextPhoto}
              >
                <ChevronRight size={36} />
              </button>
            </div>

            {/* Bottom Thumbnails Carousel */}
            <div className="lightbox-thumbnails">
              {currentDarshan.photos.map((photo, idx) => (
                <div
                  key={photo.url || idx}
                  className={`lightbox-thumb-item ${
                    idx === lightboxIndex ? "active" : ""
                  }`}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setIsZoomed(false);
                  }}
                >
                  <img src={photo.url} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Floating />
      <Foooter />
    </>
  );
}