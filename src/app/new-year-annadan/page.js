'use client'

import UniversalDonateForm from "@/Components/UniversalDonateForm"
import { Suspense } from "react";
export default function Page({ params }) {

    return (
        <Suspense fallback={<div>Loading...</div>}>
        <UniversalDonateForm

        {...params}

        heading={"NEW YEAR ANNADAN SEVA"}

        defaultReferral={"facebook"}

        payingOptions={
            [
                { title: "50 dronas", amount: 516, imagePath: '/donateForIMGs/new-year-annadan.jpeg' },
                { title: "100 dronas", amount: 1116, imagePath: '/donateForIMGs/new-year-annadan.jpeg' },
                { title: "150 dronas", amount: 1516, imagePath: '/donateForIMGs/new-year-annadan.jpeg' },

            ]
        }

        fields={
            ['amount', 'name', 'phone', 'email', 'dob', 'pan', 'pin', 'address']
        }

    />
    </Suspense>
    );
}