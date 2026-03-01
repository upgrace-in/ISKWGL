'use client'

import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    return <UniversalDonateForm

        {...params}

        heading={"GAURAPURNIMA SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "Full Day Arati Seva", amount: 2516, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Full Day Naivedyam Seva", amount: 3516, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Maha Abhishekam Seva", amount: 7516, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Flowers - Garlands & Decoration", amount: 10116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Prasadam Seva (10 devotees)", amount: 1116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Prasadam Seva (50 devotees)", amount: 5116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Prasadam Seva (100 devotees)", amount: 10116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Prasadam Seva (250 devotees)", amount: 25116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Prasadam Seva (500 devotees)", amount: 50116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' },
                { title: "Sampoorna Seva", amount: 100116, imagePath: '/donateForIMGs/gaura-purnima-donation-image-1.jpeg' }
            ]
        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }
    />
}