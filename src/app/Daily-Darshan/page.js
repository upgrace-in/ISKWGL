"use client";

import React, { useState, useEffect } from 'react';
import './Darshan.css';

export default function DarshanGrid() {
  const [darshanDays, setDarshanDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null); // For the "View All" modal

  useEffect(() => {
    // Fetch grouped darshan data from your backend
    fetch('https://iskconwarangal.in/api/handleWebhook/daily-darshan')
      .then((res) => res.json())
      .then((data) => setDarshanDays(data))
      .catch((err) => console.error('Error fetching darshans:', err));
  }, []);

  return (
    <div className="darshan-section">
      <h2>🙏 Daily Darshan Gallery</h2>
      
      {/* Grid of Days matching your reference image */}
      <div className="darshan-grid">
        {darshanDays.map((day, index) => (
          <div key={index} className="darshan-card">
            <img src={day.mainImage} alt={`Darshan on ${day.date}`} loading="lazy" />
            <div className="card-footer">
              <span className="date-text">{day.date}</span>
              <button 
                className="view-all-btn" 
                onClick={() => setSelectedDay(day)} // Opens modal for this specific day
              >
                View All
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* "View All" Popup Modal */}
      {selectedDay && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedDay(null)}>&times;</button>
            <h3>Darshan Photos - {selectedDay.date}</h3>
            
            <div className="modal-photos-grid">
              {selectedDay.photos.map((photo, pIndex) => (
                <div key={pIndex} className="modal-photo-item">
                  <img src={photo.url} alt={photo.caption} />
                  <p>{photo.caption}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}