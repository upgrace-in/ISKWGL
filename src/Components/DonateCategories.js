import AccordionItem from "./AccordionItem"

export default function DonateCategories() {

    return (
        <>
            <section class="campaign-main-sec py-5" id="annadan">
                <div class="container">
                    <div class="row mb-4">
                        <div class="col-lg-10 mx-auto">
                            <div class="heading">
                                <h2 class="head-1 text-uppercase">
                                    JOIN US IN FOOD FOR LIFE
                                </h2>
                            </div>
                        </div>
                    </div>
                    <div class="row align-item-center">
                        <div class="col-lg-12">
                            <div class="donate-bars-wrap">
                                <div class="donate-bar mt-0">
                                    <div class="first">
                                        <h4>Feed 50 people</h4>
                                    </div>
                                    <div class="mid"><span>₹1,500</span></div>
                                    <div class="last">
                                        <a href={`/donate/Feed 50 People/1500`} class="custom-btn-cls box-hover w-100 h-100"><svg class="me-2" width="24"
                                            height="24" viewBox="0 0 512 512"></svg>Donate</a>
                                    </div>
                                </div>
                                <div class="donate-bar mt-0">
                                    <div class="first">
                                        <h4>Feed 100 people</h4>
                                    </div>
                                    <div class="mid"><span>₹3,000</span></div>
                                    <div class="last">
                                        <a href={`/donate/Feed 100 People/3000`} class="custom-btn-cls box-hover w-100 h-100"><svg class="me-2" width="24"
                                            height="24" viewBox="0 0 512 512"></svg>Donate</a>
                                    </div>
                                </div>
                                <div class="donate-bar mt-0">
                                    <div class="first">
                                        <h4>Feed 200 people</h4>
                                    </div>
                                    <div class="mid"><span>₹6,000</span></div>
                                    <div class="last">
                                        <a href={`/donate/Feed 200 People/6000`} class="custom-btn-cls box-hover w-100 h-100"><svg class="me-2" width="24"
                                            height="24" viewBox="0 0 512 512"></svg>Donate</a>
                                    </div>
                                </div>
                                <div class="donate-bar mt-0">
                                    <div class="first">
                                        <h4>Feed 500 people</h4>
                                    </div>
                                    <div class="mid"><span>₹15,000</span></div>
                                    <div class="last">
                                        <a href={`/donate/Feed 500 People/15000`} class="custom-btn-cls box-hover w-100 h-100"><svg
                                            class="me-2" width="24" height="24" viewBox="0 0 512 512"></svg>Donate</a>
                                    </div>
                                </div>
                                <div class="donate-bar mt-0">
                                    <div class="first">
                                        <h4>Feed 1000 people</h4>
                                    </div>
                                    <div class="mid"><span>₹30,000</span></div>
                                    <div class="last">
                                        <a href={`/donate/Feed 1000 People/30000`} class="custom-btn-cls box-hover w-100 h-100"><svg
                                            class="me-2" width="24" height="24" viewBox="0 0 512 512"></svg>Donate</a>
                                    </div>
                                </div>
                                <div class="donate-bar mt-0">
                                    <div class="first">
                                        <h4>General Donation</h4>
                                    </div>
                                    <div class="mid">
                                        <span>Amount of your Choice</span>
                                    </div>
                                    <div class="last">
                                        <a href={`/donate/General Donation Amount of your Choice/0`} class="custom-btn-cls box-hover w-100 h-100"><svg
                                            class="me-2" width="24" height="24" viewBox="0 0 512 512">
                                            <g id="#000000ff">
                                                <path fill="#fff" opacity="1.00"
                                                    d=" M 240.87 0.00 L 271.11 0.00 C 271.12 23.56 271.10 47.13 271.12 70.69 C 278.55 78.00 285.73 85.57 292.93 93.12 C 292.95 76.54 292.92 59.97 292.94 43.40 C 303.02 43.40 313.09 43.40 323.17 43.40 C 323.19 71.57 323.17 99.73 323.18 127.90 C 331.42 138.10 339.26 148.61 346.63 159.46 C 346.64 137.37 346.62 115.29 346.64 93.20 C 356.72 93.20 366.79 93.20 376.87 93.20 C 376.87 136.13 376.90 179.05 376.86 221.98 C 376.42 229.97 377.25 237.98 376.38 245.95 C 373.97 274.61 360.71 302.13 339.99 322.05 C 321.42 340.19 296.85 351.94 271.12 355.21 C 271.11 366.91 271.11 378.61 271.12 390.31 C 286.65 375.79 305.12 364.48 325.08 357.17 C 354.11 346.30 378.78 324.33 392.85 296.70 C 397.90 286.96 401.26 276.47 405.23 266.27 C 410.15 253.23 415.05 240.18 419.97 227.14 C 429.42 230.65 438.85 234.21 448.27 237.80 C 440.90 257.30 433.64 276.84 426.18 296.30 C 413.01 329.98 387.76 358.74 356.03 376.10 C 348.32 380.37 340.21 383.86 331.96 386.95 C 315.05 393.61 299.63 404.02 287.06 417.14 C 281.25 423.07 276.36 429.82 271.12 436.25 C 271.11 442.92 271.10 449.59 271.12 456.26 C 286.53 443.79 303.78 433.67 322.10 426.12 C 337.73 419.29 354.63 416.05 370.31 409.34 C 397.37 398.12 422.44 380.48 439.16 356.12 C 445.07 347.64 449.30 338.18 453.88 328.96 C 460.97 314.57 468.03 300.16 475.14 285.78 C 484.16 290.28 493.22 294.67 502.25 299.16 C 492.88 318.18 483.57 337.21 474.16 356.20 C 460.74 382.95 438.96 404.91 413.77 420.77 C 395.81 432.18 376.04 440.59 355.60 446.40 C 337.32 451.62 319.68 459.31 303.76 469.75 C 290.89 477.89 280.11 488.71 269.24 499.25 C 265.08 503.53 260.27 507.21 256.67 512.00 L 255.34 512.00 C 248.74 504.20 240.80 497.65 233.66 490.36 C 216.69 473.19 195.66 460.33 173.13 451.81 C 165.00 448.65 156.58 446.37 148.26 443.77 C 129.82 437.90 112.09 429.70 95.87 419.13 C 71.70 403.40 50.81 382.00 37.85 356.08 C 28.43 337.09 19.11 318.05 9.76 299.04 C 18.80 294.59 27.83 290.11 36.90 285.71 C 43.21 298.54 49.53 311.37 55.84 324.20 C 62.31 337.10 68.00 350.59 77.15 361.91 C 98.72 389.55 130.67 407.44 163.99 416.98 C 191.82 424.87 218.38 437.79 240.85 456.12 C 240.88 449.46 240.86 442.80 240.87 436.14 C 235.52 429.50 230.46 422.58 224.45 416.51 C 214.99 406.68 203.88 398.49 191.81 392.16 C 181.54 386.69 170.20 383.61 159.95 378.09 C 126.61 361.07 99.83 331.67 86.08 296.85 C 78.51 277.18 71.21 257.41 63.73 237.71 C 73.15 234.11 82.60 230.62 92.02 227.02 C 99.34 246.35 106.55 265.72 113.92 285.04 C 124.85 313.15 146.28 336.97 173.08 350.82 C 181.14 355.21 189.96 357.90 198.29 361.70 C 213.93 368.76 228.29 378.51 240.87 390.17 C 240.86 378.51 240.87 366.86 240.87 355.21 C 211.10 351.48 183.03 336.20 163.73 313.25 C 144.91 291.15 134.38 262.05 135.21 233.00 C 134.98 186.40 135.15 139.80 135.11 93.20 C 145.18 93.20 155.26 93.20 165.34 93.20 C 165.36 115.29 165.33 137.38 165.36 159.47 C 171.00 151.17 176.88 143.02 183.09 135.14 C 184.73 133.01 186.64 131.05 187.89 128.65 C 188.51 125.47 188.14 122.21 188.20 119.00 C 188.18 93.80 188.19 68.60 188.19 43.40 C 198.27 43.41 208.35 43.39 218.43 43.41 C 218.44 60.21 218.43 77.01 218.44 93.81 C 225.83 86.03 233.20 78.23 240.86 70.72 C 240.87 47.15 240.86 23.57 240.87 0.00 M 185.74 183.64 C 177.92 196.25 170.60 209.46 166.88 223.92 C 164.77 231.83 165.17 240.13 166.28 248.16 C 169.13 268.55 179.32 287.78 194.47 301.71 C 208.29 314.61 226.26 322.97 245.04 325.20 C 264.50 327.61 284.73 323.49 301.62 313.50 C 321.67 301.88 336.92 282.28 343.18 259.96 C 346.67 247.01 348.32 232.93 344.00 219.97 C 338.59 202.94 329.12 187.57 319.15 172.88 C 300.53 146.10 278.79 121.63 256.00 98.35 C 230.28 124.75 205.59 152.49 185.74 183.64 Z">
                                                </path>
                                                <path fill="#fff" opacity="1.00"
                                                    d=" M 243.47 185.63 C 255.90 183.14 269.24 185.31 280.14 191.81 C 293.18 199.46 302.60 213.03 305.01 227.97 C 307.31 241.25 304.15 255.36 296.36 266.36 C 288.25 278.07 275.13 286.21 260.99 288.09 C 245.71 290.35 229.59 285.24 218.36 274.65 C 208.71 265.74 202.62 253.07 201.87 239.94 C 201.02 227.39 204.94 214.59 212.72 204.71 C 220.27 194.96 231.38 188.06 243.47 185.63 M 249.14 215.33 C 239.25 217.31 231.61 226.89 231.98 236.99 C 231.96 247.10 239.95 256.46 249.93 258.04 C 259.70 259.99 270.20 254.16 273.86 244.94 C 277.20 237.15 275.36 227.54 269.42 221.51 C 264.33 216.12 256.38 213.73 249.14 215.33 Z">
                                                </path>
                                            </g>
                                        </svg>Donate</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="donate-new" id="donate">
                <div class="container">
                    <div class="row mb-5">
                        <div class="col-md-10 mx-auto">
                            <div class="heading">
                                <h2 class="head-1">TURN YOUR MONEY INTO PRASAD</h2>
                                <p class="b-line">
                                    If you would like to make a donation towards a particular area
                                    of activity, please select an option from below. ISKCON relies
                                    entirely on voluntary donations and so every donation counts.
                                    Please note that donation is processed on a secure site.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="accordion_wrap">
                        <div class="accordion">
                            <AccordionItem

                                heading={"POPULAR DONATIONS"}
                                data={
                                    [
                                        { title: "A General Donation" },
                                        { title: "Festival Seva" },
                                        { title: "Food For Life", src:"/annadanam" },
                                        { title: "Janmashtami", src: "/janmashtami"  },
                                        { title: "Sponsor Sankirtan" },
                                        { title: "Sponsor Gita" },
                                        { title: "Offer A Puja" },
                                        { title: "Deity Worship Seva" },
                                        { title: "Birthday Seva", src:"/birthday-annadan-seva" },
                                        { title: "Go Seva", src:"/go-seva" },
                                    ]
                                }
                            />
                            <AccordionItem

                                heading={"EVENTS & FESTIVALS"}
                                data={
                                    [
                                        { title: "Janmastami",  src: "/janmashtami" },
                                        { title: "Deepawali",  src: "/deepawali" },
                                        { title: "Srila Prabhupada's Appearance Day" },
                                        { title: "Radha Ashtami", src: "/radhashtami" },
                                        { title: "Pitru Paksha", src: "/pitrupaksha" },
                                        { title: "Jhulan Yatra", src: "/jhulanYatra"},
                                        { title: "Govardhan Puja" },
                                        { title: "Gita Jayanti" },
                                        { title: "Sharad Purnima" },
                                        { title: "Kartik - The Holiest Month", src: "/kartikMonth" },
                                        { title: "Nityananda Trayodasi" },
                                        { title: "Gaura Purnima" },
                                        { title: "Narsimha Chaturdasi" },
                                        { title: "Ram Navami" },
                                        { title: "Akshay Tritiya (Chandan Yatra)", src: `/donate/Akshay_Tritiya/0` },
                                        { title: "Balarama Jayanti" },
                                        { title: "Snana Yatra" },
                                        { title: "Ratha Yatra", src:"/rathyatra"},
                                        { title: "ISKCON Warangal's Anniversary" }
                                    ]
                                }
                            />
                            <AccordionItem

                                heading={"Food For Life (ANNADAN SEVA)"}
                                data={
                                    [
                                        { title: "Special Occasion" },
                                        { title: "Feed 100 People", src: `/donate/Feed 100 People/3000` },
                                        { title: "Feed 200 People", src: `/donate/Feed 200 People/6000` },
                                        { title: "Feed 500 People", src: `/donate/Feed 500 People/15000` },
                                        { title: "General Donation Amount of your Choice" },
                                        { title: "Fund-raising for Community Kitchen" }
                                    ]
                                }
                            />
                            <AccordionItem

                                heading={"DEITY WORSHIP"}
                                data={
                                    [
                                        { title: "FLOWER SEVA" },
                                        { title: "DEITY DRESS SEVA" },
                                        { title: "DEITY WORSHIP SEVA" }
                                    ]
                                }
                            />
                            <AccordionItem

                                heading={"MEMBERSHIPS"}
                                data={
                                    [
                                        { title: "Life Membership" }
                                    ]
                                }
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}