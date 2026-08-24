'use client'

import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    return <UniversalDonateForm

        {...params}

        heading={"DEEPAWALI SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "Annadanam Seva (50 Devotees)", amount: 1256, imagePath: '/headerImages/deepwali.jpeg' },
                { title: "Annadanam Seva (100 Devotees)", amount: 2516, imagePath: '/headerImages/deepwali.jpeg' },
                { title: "Annadanam Seva (150 Devotees)", amount: 3756, imagePath: '/headerImages/deepwali.jpeg' },

            ]
        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }

    />
}