"use client";
import React from "react";

const whatsappGroups = [
  {
    name: "ISKCON Warangal Group 13",
    link: "https://chat.whatsapp.com/HgmOCL5hHGeKRVDKNEqFz3",
  },
  {
    name: "ISKCON Warangal Group 14",
    link: "https://chat.whatsapp.com/DaoVN81hhdPAS9yRhfLad3",
  },
  {
    name: "ISKCON Warangal Group 15",
    link: "https://chat.whatsapp.com/FnJEyjYdxJC1FERVDWJDbY",
  },
  {
    name: "ISKCON Warangal Group 16",
    link: "https://chat.whatsapp.com/ByBq5iAhuvY0x1LZTrB5sk",
  },
];

export default function WhatsAppGroups() {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "2rem",
        textAlign: "center",
        background: "#f8f5f0",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ color: "#006400", marginBottom: "1rem" }}>
        Join Our ISKCON Warangal WhatsApp Groups
      </h1>
      <p style={{ marginBottom: "2rem", color: "#333" }}>
        Stay connected for events, seva opportunities, and daily Krishna katha
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxWidth: "400px",
          margin: "0 auto",
        }}
      >
        {whatsappGroups.map((group, index) => (
          <a
            key={index}
            href={group.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "0.75rem 1rem",
              background: "#25D366",
              color: "#fff",
              borderRadius: "6px",
              fontWeight: "bold",
              textDecoration: "none",
              fontSize: "1rem",
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#1ebc57")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#25D366")}
          >
            📲 Join {group.name}
          </a>
        ))}
      </div>
    </div>
  );
}
