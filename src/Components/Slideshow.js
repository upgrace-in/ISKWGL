import { useState, useEffect } from "react"
import Image from "next/image"

export default function Slideshow({ images }) {
    const [current, setCurrent] = useState(0)
    if (!images || images.length === 0) return null

    useEffect(() => {
        if (images.length <= 1) return;
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % images.length)
        }, 3000)
        return () => clearInterval(interval)
    }, [images])

    return (
            <Image
                src={images[current]}
                alt={`Slide ${current + 1}`}
                width={300}
                height={300}
            />
    )
}
