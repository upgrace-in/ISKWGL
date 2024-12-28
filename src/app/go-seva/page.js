'use client'

import UniversalDonateForm from "@/Components/UniversalDonateForm"

export default function Page({ params }) {

    return <UniversalDonateForm

        {...params}

        heading={"GO SEVA OPPORTUNITIES"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "1 month (4 cows)", amount: 8116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "1 month (2 cows)", amount: 4116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "15 days (4 cows)", amount: 4116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "15 days (2 cows)", amount: 2116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "1 week (4 cows)", amount: 2116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "1 week (2 cows)", amount: 1116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "4 days (4 cows)", amount: 1116, imagePath: '/headerImages/go-seva.jpeg' },
                { title: "4 days (2 cows)", amount: 516, imagePath: '/headerImages/go-seva.jpeg' },

            ]
        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }

    />
}