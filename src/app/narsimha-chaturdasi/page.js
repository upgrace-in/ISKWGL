'use client'
import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    return <UniversalDonateForm

        {...params}

        heading={"NARSIMHA CHATURDASI SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "Prasadam Seva (10 devotees)", amount: 1116, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' },
                { title: "Prasadam Seva (50 devotees)", amount: 5116, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' },
                { title: "Prasadam Seva (100 devotees)", amount: 10116, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' },
                { title: "Prasadam Seva (150 devotees)", amount: 15116, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' },
                { title: "Full day Arti and Naivedya Seva", amount: 2116, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' },
                { title: "Maha Abhishekam Seva", amount: 3516, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' },
                { title: "Flower, Garlands and Decoration", amount: 7116, imagePath: '/donateForIMGs/narsimha-chaturdasi-poster.jpeg' }
            ]

        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }
    />
}