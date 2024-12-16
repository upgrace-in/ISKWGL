"use client"
import { useState } from "react"

export default function AccordionItem(props) {

    const [status, setStatus] = useState(props?.open ? "show" : '')

    const clicked = () => {
        setStatus(old => old !== 'show' ? 'show' : '')
    }

    return (
        <div class="accordion-item">
            <h2 class="accordion-header" onClick={clicked}>
                <button type="button" aria-expanded="true" class="accordion-button">
                    <span class="h-icon"><svg stroke="currentColor" fill="currentColor" strokeWidth="0"
                        viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z">
                        </path>
                    </svg></span><span>{props?.heading}</span>
                </button>
            </h2>
            <div class={`accordion-collapse collapse ${status}`}>
                <div class="accordion-body">
                    <div class="row w-100 m-0">
                        {
                            props?.data.map((d, i) => {
                                return <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-3" key={i}>
                                    <a href={d?.src ? d.src : `/donate/${d?.title}/0`}>
                                        <div><span>{d?.title}</span></div>
                                        <span class="icon"><svg class="donate-arrow" stroke="currentColor" fill="currentColor"
                                            strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M256 8c137 0 248 111 248 248S393 504 256 504 8 393 8 256 119 8 256 8zM140 300h116v70.9c0 10.7 13 16.1 20.5 8.5l114.3-114.9c4.7-4.7 4.7-12.2 0-16.9l-114.3-115c-7.6-7.6-20.5-2.2-20.5 8.5V212H140c-6.6 0-12 5.4-12 12v64c0 6.6 5.4 12 12 12z">
                                            </path>
                                        </svg></span>
                                        <div class="camp-tooltip d-none">
                                            {d?.caption}
                                        </div>
                                    </a>
                                </div>
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}