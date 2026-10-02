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
import Header from "../../../Components/Header";
import SideNav from "../../../Components/SideNav";
import Foooter from "../../../Components/footter";
import Floating from "@/Components/Floating";

function slugToDate(slug) {
  return slug
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

export default function DarshanDatePage({ params }) {
  const [currentDarshan, setCurrentDarshan] = useState(null);
  const [navigationDates, setNavigationDates] = useState({ prev: null, next: null });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [navOpen, setNavOpen] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const requestedDateStr = slugToDate(params.date);

  useEffect(() => {
    async function fetchDarshanDetails() {
      try {
        setLoading(true);
        // 1. Fetch exact photos for the requested date
        const res = await fetch(`/api/upload-darshan?date=${encodeURIComponent(requestedDateStr)}`);
        
        if (!res.ok) {
          throw new Error("Darshan not found");
        }

        const darshanData = await res.json();
        setCurrentDarshan(darshanData);

        // 2. Fetch lightweight summary list to calculate Previous/Next navigation links
        const listRes = await fetch("/api/upload-darshan");
        if (listRes.ok) {
          const listData = await listRes.json();
          const currentIndex = listData.findIndex((item) => item.date.toLowerCase() === requestedDateStr.toLowerCase());
          
          if (currentIndex !== -1) {
            setNavigationDates({
              prev: currentIndex < listData.length - 1 ? listData[currentIndex + 1] : null,
              next: currentIndex > 0 ? listData[currentIndex - 1] : null,
            });
          }
        }
      } catch (err) {
        console.error("Failed to load darshan details:", err);
        setError("Darshan not found for this date.");
      } finally {
        setLoading(false);
      }
    }

    fetchDarshanDetails();
  }, [params.date, requestedDateStr]);

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

  if (loading) {
    return (
      <div className="darshan-loading-page">
        <Loader2 size={40} className="loading-spinner" />
        <span>Loading Darshan...</span>
      </div>
    );
  }

  if (error || !currentDarshan) {
    return (
      <div className="darshan-not-found">
        <h2>{error || "Darshan not found"}</h2>
        <a href="/Daily-Darshan">Go back to Daily Darshan</a>
      </div>
    );
  }

  return (
    <>
      <Header handleNav={() => setNavOpen(!navOpen)} />
      <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
      <div className="darshan-page">
        {/* HEADER */}
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

        {/* DETAIL CONTENT */}
        <main className="darshan-detail-content">
          <div className="detail-top">
            <h2 className="detail-date">
              <span>-</span> {currentDarshan.date}
            </h2>

            {/* NAVIGATION */}
            <div className="date-navigation">
              {navigationDates.prev ? (
                <a
                  href={`/Daily-Darshan/${navigationDates.prev.date.toLowerCase().replace(/,/g, "").replace(/\s+/g, "-")}`}
                  className="navigation-link"
                >
                  <ChevronLeft size={18} />
                  <span>PREVIOUS</span>
                </a>
              ) : (
                <div className="navigation-placeholder"></div>
              )}

              {navigationDates.next ? (
                <a
                  href={`/Daily-Darshan/${navigationDates.next.date.toLowerCase().replace(/,/g, "").replace(/\s+/g, "-")}`}
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

          {/* PHOTOS GRID */}
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
                    loading="lazy"
                  />
                </div>
              ))}
          </div>
        </main>

        {/* LIGHTBOX MODAL */}
        {lightboxIndex !== null && currentDarshan.photos && (
          <div className="lightbox-overlay">
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
                  loading="lazy"
                />
              </div>

              <button
                className="lightbox-nav-btn right"
                onClick={handleNextPhoto}
              >
                <ChevronRight size={36} />
              </button>
            </div>

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
                  <img src={photo.url} alt={`Thumbnail ${idx + 1}`} loading="lazy"/>
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