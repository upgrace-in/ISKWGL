'use client'
import React from 'react';
import SideNav from "../../Components/SideNav"
import axios from 'axios'
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import Foooter from "../../Components/footter"
import Floating from "@/Components/Floating";
import Header from "../../Components/Header"
import "./donationoption.css"


export default function DonatePage({}) {
    const [navOpen, setNavOpen] = useState(false)
    
    const donationOptions = [
        // { 
        //     id: 1, 
        //     title: 'Pasankusa Ekadasi', 
        //     subtitle: '22 Oct 2026', 
        //     image: '/images/Ekadasi/pasankusa-ekadasi.jpeg',
        //     pagelink: '/Ekadasi' 
        // },
        { 
            id: 2, 
            title: 'Kartik Month Seva', 
            image: '/donateForIMGs/Kartik_month/yashoda-krishna.webp' ,
            subtitle: '26 Oct - 24 Nov 2026', 
            pagelink: '/kartikMonth'
        },
        {
            id: 4, 
            title: 'Nitya Seva', 
            image: '/images/radhaastami_mobile.png' ,
            subtitle: 'Daily Deity Seva', 
            pagelink: '/nityaSeva'
        },
        { 
            id: 5, 
            title: 'Anna Daan', 
            image: '/donateForIMGs/ffl.png' ,
            pagelink: '/AnnaDaan'
        },
        {
            id: 6, 
            title: 'Go Seva', 
            image: '/images/cow.png' ,
            pagelink: '/go-seva'
        },
        { 
            id: 7, 
            title: 'Tula Daan', 
            image: '/donateForIMGs/Tula_Dan/tula_danam-warangal.jpeg' ,
            pagelink: '/TulaDanSeva'
        }
        // { 
        //     id: 4, 
        //     title: 'Gau Seva', 
        //     image: '/images/cow.png' 
        // },
        // { 
        //     id: 5, 
        //     title: 'Daily Deity Seva', 
        //     image: '/images/Sri-Radha-Nilamadhava-3.png' ,
        //     pagelink: '/DailyDeitySeva'
        // },
        // { 
        //     id: 6, 
        //     title: 'AnnaDaan for Devotees', 
        //     image: '/headerImages/Annadanam.png' ,
        //     pagelink: '/AnnaDaanForDevotees'
        // },
        // { 
        //     id: 8, 
        //     title: 'Gita Daan', 
        //     image: '/headerImages/Annadanam.png' 
        // },
    ];
  return (
        <>
            <Header handleNav={() => setNavOpen(!navOpen)} />
            <SideNav openNav={navOpen ? "open-nav" : ""} handleNav={() => setNavOpen(!navOpen)} />
            <div className="donate-page-container">
                {/* Header Section */}
                <div className="donate-header">
                    <h1>Donate</h1>
                    <p className="gita-quote">
                    As said in Bhagavad Gita 18.5- acts of sacrifice, charity and penance are not to be given up; 
                    they must be performed. Indeed, sacrifice, charity and penance purify even the great souls.
                    </p>
                </div>

                {/* Grid Section */}
                <div className="donate-grid">
                    {donationOptions.map((option) => (
                    <a key={option.id} href={option.pagelink} className="donate-card">
                        <div className="card-image-wrapper">
                        <img src={option.image} alt={option.title} className="card-image" />
                        </div>
                        <div className="card-content">
                        <h3>{option.title}</h3>
                        {option.subtitle && <p className="card-subtitle">{option.subtitle}</p>}
                        </div>
                    </a>
                    ))}
                </div>
            </div>
            <Foooter />
            <Floating />
    </>
  );
};

