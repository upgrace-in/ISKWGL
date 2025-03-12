'use client'

import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    return <UniversalDonateForm

        {...params}

        heading={"GAURAPURNIMA SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "Prasadam Seva (15 devotees)", amount: 1516, imagePath: '/donateForIMGs/chaitanya-mahaprabhu.jpg' },
                { title: "Prasadam Seva (30 devotees)", amount: 3116, imagePath: '/donateForIMGs/chaitanya-mahaprabhu.jpg' },
                { title: "Prasadam Seva (60 devotees)", amount: 6116, imagePath: '/donateForIMGs/chaitanya-mahaprabhu.jpg' },
                { title: "Prasadam Seva (100 devotees)", amount: 10116, imagePath: '/donateForIMGs/chaitanya-mahaprabhu.jpg' },
                { title: "Puspa Alankar Seva", amount: 2116, imagePath: '/donateForIMGs/chaitanya-mahaprabhu.jpg' }
            ]
        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }
    />
}