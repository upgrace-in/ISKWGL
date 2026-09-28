"use client";

import React, { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { Upload, CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import "../Daily-Darshan/Darshan.css";
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";

// Helper function to compress and resize images on the client side
async function compressImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Max width limit to keep file sizes tiny (e.g., 1200px)
        const maxWidth = 1200;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed WebP or JPEG blob (quality 0.8)
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/webp",
          0.8
        );
      };
    };
  });
}

export default function UploadDarshan() {
  const [imageFiles, setImageFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setStatusMessage] = useState({ type: "", text: "" });

  const fileInputRef = useRef(null);
  const [navOpen, setNavOpen] = useState(false)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setStatusMessage({ type: "info", text: "Optimizing images for fast loading..." });
      
      // Compress each selected image instantly
      const compressedFiles = await Promise.all(files.map((file) => compressImage(file)));
      
      setImageFiles((prev) => [...prev, ...compressedFiles]);
      setStatusMessage({ type: "", text: "" });
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
    if (fileInputRef.current && imageFiles.length <= 1) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      setStatusMessage({ type: "error", text: "Please select at least one image." });
      return;
    }

    setUploading(true);
    setStatusMessage({ type: "info", text: `Uploading ${imageFiles.length} photos together...` });

    try {
      // Upload all selected files concurrently directly from the browser to Vercel Blob
      const uploadPromises = imageFiles.map((file) =>
        upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/upload-darshan",
        })
      );

      await Promise.all(uploadPromises);

      setStatusMessage({ type: "success", text: "All darshan photos uploaded successfully!" });
      setImageFiles([]);
      setCaption("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Upload error:", err);
      setStatusMessage({ type: "error", text: "Failed to upload images. Please try again." });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Header handleNav={() => setNavOpen(!navOpen)} />
      <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
      <div className="darshan-page">
        {/* HEADER BANNER */}
        <section className="darshan-header">
          <div className="darshan-header-inner">
            <h1>Upload Daily Darshan</h1>
            <div className="header-line"></div>
            <div className="breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <span className="breadcrumb-current">Upload Darshan</span>
            </div>
          </div>
        </section>

        {/* UPLOAD FORM CONTAINER */}
        <main className="upload-container">
          <div className="upload-card">
            <div className="upload-card-header">
              <h2>🙏 Upload Daily Darshan</h2>
              <p>Select multiple Sringar Darshan photos and add an optional caption.</p>
            </div>

            <form onSubmit={handleSubmit} className="upload-form">
              {/* FILE DROPZONE / PICKER */}
              <div className="form-group">
                <label className="form-label">Darshan Photos</label>

                <div 
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={38} className="dropzone-icon" />
                  <span className="dropzone-text">Click to browse or select images</span>
                  <span className="dropzone-hint">You can select multiple files at once</span>
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*" 
                  multiple 
                  onChange={handleFileChange} 
                  style={{ display: "none" }}
                />

                {/* MULTI-IMAGE PREVIEW GRID */}
                {imageFiles.length > 0 && (
                  <div className="multi-preview-grid">
                    {imageFiles.map((file, index) => (
                      <div className="preview-thumb-card" key={index}>
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`Preview ${index + 1}`} 
                        />
                        <button 
                          type="button" 
                          className="remove-thumb-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(index);
                          }}
                          title="Remove image"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CAPTION INPUT */}
              <div className="form-group">
                <label className="form-label">Caption (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Mangala Aarti Darshan - Sri Sri Radha Madhava" 
                  value={caption} 
                  onChange={(e) => setCaption(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* STATUS MESSAGE */}
              {message.text && (
                <div className={`status-banner ${message.type}`}>
                  {message.type === "success" && <CheckCircle2 size={18} />}
                  {message.type === "error" && <AlertCircle size={18} />}
                  {message.type === "info" && <Loader2 size={18} className="loading-spinner" />}
                  <span>{message.text}</span>
                </div>
              )}

              {/* SUBMIT BUTTON */}
              <button 
                type="submit" 
                disabled={uploading}
                className="upload-submit-btn"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="loading-spinner" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Publish {imageFiles.length > 0 ? `${imageFiles.length} Photos` : "Darshans"}</span>
                )}
              </button>
            </form>
          </div>
        </main>
      </div>
      <Floating />
      
      <Foooter />
    </>
  );
}