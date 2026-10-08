"use client";

import React, { useEffect, useState } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import "./deityseva.css";
import Header from "../../Components/Header"
import SideNav from "../../Components/SideNav"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import { useDonateTest } from "@/Helpers/PaymentPageHandler-copy";
import DirectDonation from "@/Components/Direct_donation_and_80G"

export default function NityaSeva() {
    const [navOpen, setNavOpen] = useState(false)
    const { handleDonateClick } = useDonateTest();
    const [amount, setAmount] = useState();

    const Sevas = [
        {
            id: 1,
            title: "NAIVEDYAM SEVA",
            image: "/donateForIMGs/Nitya_Seva/naividyam-4am.jpeg",
            amount: 516,
            subtitle: "(4 AM)"
        },
        {
            id: 2,
            title: "NAIVEDYAM SEVA",
            image: "/donateForIMGs/Nitya_Seva/naividyam-4pm.jpeg",
            amount: 516,
            subtitle: "(4 PM & 8 PM)"
        },
        {
            id: 3,
            title: "NAIVEDYAM SEVA",
            image: "/donateForIMGs/Nitya_Seva/naividyam-8am.jpeg",
            amount: 1116,
            subtitle: "(8 AM, 12 PM, 7 PM)"
        },
        {
            id: 4,
            title: "VIGRAHA FLOWER GARLAND SEVA",
            image: "/donateForIMGs/Nitya_Seva/flower-seva.png",
            amount: 516,
        },
        {
            id: 5,
            title: "GO SEVA",
            image: "/donateForIMGs/Nitya_Seva/go-seva.jpeg",
            amount: 1116,
        },
        {
            id: 6,
            title: "AARTI SEVA",
            image: "/donateForIMGs/Nitya_Seva/aarti-seva.png",
            amount: 1516,
            subtitle: "(6 TIMES)"
        },
        {
            id: 7,
            title: "GITA DANAM",
            image: "/donateForIMGs/Nitya_Seva/gita-danam.jpeg",
            amount: 2516,
            subtitle: "(10 GITAS)"
        },
        {
            id: 8,
            title: "VAISHNAVA PRASADA SEVA",
            image: "/donateForIMGs/Nitya_Seva/prasad-seva.jpeg",
            amount: 3116,
        },
        {
            id: 9,
            title: "ANNADANAM",
            image: "/donateForIMGs/Nitya_Seva/annadanam.jpeg",
            amount: 5116,
        },
        {
            id: 10,
            title: "GO DANAM",
            image: "/donateForIMGs/Nitya_Seva/go-danam.jpeg",
            amount: 35116,
        },
        {
            id: 11,
            title: "LIFE MEMBERSHIP",
            image: "/donateForIMGs/Nitya_Seva/life-membership.jpeg",
            amount: 55555,
        }
    ];

    return (
        <>
        
        <Header handleNav={() => setNavOpen(!navOpen)} />
        <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
        <div className="darshan-page">

            {/* HEADER */}
            <section className="darshan-header">
            <div className="darshan-header-inner">

                <h1>NITYA SEVA</h1>

                <div className="header-line"></div>

                <div className="breadcrumb">
                <a href="/">Home</a>

                <ChevronRight size={15} />

                <span className="breadcrumb-current">
                    Nitya Seva
                </span>
                </div>

            </div>
            </section>

            <div className="deityseva-content">
                <p>In this endeavour of offering service to Lord Krsna, you get eternal credit, and a little service offer to Lord Krsna can protect one from the most dangerous type of fear. --Bhagavad Gita 2.40</p>
                <p>While Krsna was going to the fruit vendor very hastily, most of the grains He was holding fell. Nonetheless, the fruit vendor filled Krsna’s hands with fruits, and her fruit basket was immediately filled with jewels and gold. --Srimad Bhagavatam 10.11.11</p>
            </div>

            <div className="donate-grid">
                {Sevas.map((option) => (
                <div key={option.id} className="donate-card">
                    <div className="card-image-wrapper">
                        <img src={option.image} alt={option.title} className="card-image" />
                    </div>
                    <div className="card-content">
                        <h3>{option.title}</h3>

                        {option.subtitle && (
                            <p className="card-subtitle">{option.subtitle}</p>
                        )}

                        <button
                            type="button"
                            className="action-btn"
                            onClick={() =>
                            handleDonateClick(option.amount, "Nitya Seva - " + option.title, option.title)
                            }
                        >
                            Donate ₹{option.amount}
                        </button>
                    </div>
                </div>
                ))}
            </div>
            <div className="custom-donation">
                <h3>Custom Donation</h3>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleDonateClick(amount, "Nitya Seva", "Nitya Seva");
                    }}
                    className = "custom-dination-container"
                    >
                    {/* Input Section */}
                    <span style={{ color: '#4b5563', fontWeight: '600' }}>
                        <b>₹</b>
                    </span>

                    <div className="inputWrapper">
                        <input
                        type="number"
                        placeholder="Amount"
                        required
                        min="1"
                        onChange={(e) => setAmount(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        className="inputField"
                        />
                    </div>

                    {/* Button */}
                    <button
                        className="button"
                        type="submit"
                        onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#e8e8e8'}
                    >
                        Donate Now
                    </button>
                </form>
            </div>        

        </div>
        <div style={{margin:"auto auto auto auto", maxWidth:"1300px"}}>
            <DirectDonation />
        </div>
        <Floating />
        
        <Foooter />
        </>
    );
}
