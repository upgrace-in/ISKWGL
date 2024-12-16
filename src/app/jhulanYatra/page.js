'use client'

import JhulanYatra from "@/Components/JhulanYatra"
import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    // return <JhulanYatra {...params} defaultReferral={"facebook"} />

    return <UniversalDonateForm

        {...params}

        heading={"JHULAN YATRA SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "Prasadam Seva", amount: 1501, imagePath: '/headerImages/jhulan.jpeg' },
                { title: "Pushpalankar Seva", amount: 1116, imagePath: '/headerImages/jhulan.jpeg' },
            ]
        }

        // Sequence needs to be followed, Name keyword should be proper
        fields={
            ['amount', 'phone', 'email', 'name', 'pan', 'pin', 'address']
        }

    />
}