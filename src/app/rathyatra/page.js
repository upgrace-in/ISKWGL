'use client'

import UniversalDonateForm from "@/Components/UniversalDonateForm"

const payForData = [
    { title: "Jagannath Seva (Annadana for 250 People)", amount: 25116, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Baladeva Seva (Annadana for 150 People)", amount: 15116, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Subhadra Seva (Annadana for 100 People)", amount: 10116, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Sudarshana Seva (Annadana for 50 People)", amount: 5116, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Srila Prabhupada Seva (Annadana for 20 People)", amount: 2116, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Rath Yatra Seva (Annadana for 10 people)", amount: 1116, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Hanuman Seva (Annadana for 5 people)", amount: 516, imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
    { title: "Custom", imagePath: [
        "/donateForIMGs/Rath-yatra.png",
        "/donateForIMGs/rath-yatra-1.jpeg",
        "/donateForIMGs/rath-yatra-2.jpeg",
        "/donateForIMGs/rath-yatra-3.jpeg"
    ] },
]

const fields = [
    'name',
    'email',
    'phone',
    'address',
    'pin',
    'amount',
    'pan',
]

export default function Page() {
    return (
        <UniversalDonateForm
            heading="RATH YATRA DONATION"
            payingOptions={payForData}
            fields={fields}
            defaultReferral="rathyatra"
        />
    )
}