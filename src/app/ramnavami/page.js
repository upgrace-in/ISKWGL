'use client'
import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    return <UniversalDonateForm

        {...params}

        heading={"SRI RAM NAVAMI SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "Prasadam Seva (60 devotees)", amount: 6116, imagePath: '/donateForIMGs/sri-ram-navami-donate-image.jpeg' },
                { title: "Prasadam Seva (30 devotees)", amount: 3116, imagePath: '/donateForIMGs/sri-ram-navami-donate-image.jpeg' },
                { title: "Prasadam Seva (15 devotees)", amount: 1516, imagePath: '/donateForIMGs/sri-ram-navami-donate-image.jpeg' },
                { title: "Prasadam Seva (100 devotees)", amount: 10116, imagePath: '/donateForIMGs/sri-ram-navami-donate-image.jpeg' },
                { title: "Puspa Alankar Seva", amount: 2116, imagePath: '/donateForIMGs/sri-ram-navami-donate-image.jpeg' }
            ]
        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }
    />
}