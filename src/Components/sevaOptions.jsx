// Components/SevaOptions.jsx
"use client";

import React from "react";

const sevaList = [
  {
    title: "Mukhya Yajamana Seva",
    amount: 108000,
    imagePath: "/donateForIMGs/janmashtami-abhishek.jpeg",
    specialGifts: [
      "Special Puja on your name",
      "Opportunity to perform Panchamrita Abhishek",
      "Deities Maha Item (Glass, spoon and bowl)",
      "Radha Nilmadhav Photoframe",
      "Mahaprasadam Box",
      "Vastra Prasad",
    ],
  },
  {
    title: "Yajamana Seva",
    amount: 51116,
    imagePath: "/donateForIMGs/123.jpeg",
    specialGifts: [
      "Special Puja on your name",
      "Opportunity to perform Panchamrita Abhishek",
      "Deities Maha Item (Silver glass)",
      "Radha Krishna Photo",
      "Mahaprasadam Box",
      "Vastra Prasad",
    ],
  },
  {
    title: "Janmashtami Night Prasadam Seva",
    amount: 25116,
    imagePath: "/donateForIMGs/125.jpeg",
    specialGifts: [
      "Opportunity to perform Panchamrita Abhishek",
      "Radha Krishna Photo",
      "Mahaprasadam Box",
      "Vastra Prasad",
      "Deities Maha Item (Silver bowl)",
    ],
  },
  {
    title: "Janmashtami Annadan Seva (40,000 cups)",
    amount: 10116,
    imagePath: "/donateForIMGs/123.jpeg",
    specialGifts: [
      "Opportunity to perform Panchamrita Abhishek",
      "Radha Krishna Photo",
      "Mahaprasadam Box",
      "Vastra Prasad",
      "Deities Maha Item (silver spoon)",
    ],
  },
  {
    title: "Janmashtami Gau Seva",
    amount: 5016,
    imagePath: "/donateForIMGs/123.jpeg",
    specialGifts: [
      "Opportunity to perform Panchamrita Abhishek",
      "Mahaprasadam Box",
      "Radha Krishna Photo",
    ],
  },
  {
    title: "Panchamrita Abhishek Seva",
    amount: 3016,
    imagePath: "/donateForIMGs/124.webp",
    specialGifts: [
      "Opportunity to perform Panchamrita Abhishek",
      "Mahaprasadam Box",
    ],
  },
  {
    title: "Dugdha Abhishek Seva",
    amount: 2016,
    imagePath: "/donateForIMGs/122.jpg",
    specialGifts: ["Opportunity to perform Milk Abhishek", "Mahaprasadam Box"],
  },
  {
    title: "Custom Seva - \n Type Your Amount",
    //amount: 2016,
    imagePath: "/donateForIMGs/janmashtami-abhishek.jpeg",
    //specialGifts: ["Opportunity to perform Milk Abhishek", "Mahaprasadam Box"],
  }
];

export default function SevaOptions() {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {/* Banner */}
      <header
        style={{
          background: "#f7e8c7",
          padding: "1.5rem",
          textAlign: "center",
          borderBottom: "2px solid #d1b17a",
          position: "sticky",
        }}
      >
        <h1 style={{ margin: 0, color: "#8b4513" }}>Janmashtami Seva Options</h1>
        <p style={{ marginTop: "0.5rem", color: "#444" }}>
          Choose your seva and participate in this auspicious celebration
        </p>
      </header>

      {/* Seva Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1.5rem",
          padding: "2rem",
          justifyContent: "center",
        }}
      >
        {sevaList.map((seva, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "1rem",
              width: "300px",
              height: "565px", 
              background: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              display: "flex", // flex layout
              flexDirection: "column", // vertical stacking
              justifyContent: "space-between", // space between top content & button
            }}
          >
            <img
              src={seva.imagePath}
              alt={seva.title}
              style={{
               width: "100%",
    height: "200px",       // fixed height
    objectFit: "contain",  // ✅ keeps aspect ratio without cropping
    backgroundColor: "#f5f5f5", // optional: fills empty space
    borderRadius: "8px",
    marginBottom: "0.75rem",
              }}
            />
            <h2 style={{ fontSize: "1.25rem", color: "#333" }}>{seva.title}</h2>
           
            {seva?.amount && (<><p style={{ color: "#b12704", fontWeight: "bold" }}>
               
              ₹{seva?.amount?.toLocaleString()}
            
            </p>
            </>
            )}
    

            {seva?.specialGifts?.length > 0 && (
              <ul style={{ paddingLeft: "1.25rem", marginBottom: "1rem" }}>
                {seva.specialGifts.map((gift, i) => (
                  <li key={i} style={{ fontSize: "0.9rem", color: "#555" }}>
                    {gift}
                  </li>
                ))}
              </ul>
            )}

            <button
              style={{
                background: "#ff9800",
                color: "#fff",
                padding: "0.5rem 1rem",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
                width: "100%",
              }}
              onClick={() =>
                window.location.href = `/janmashtamiSeva?defaultValue=${index}`
              }
            >
              Select Seva
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
