'use client'

import PitrapakshaAnndan from "@/Components/PitrapakshaAnnadan"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PitrapakshaAnndan {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}