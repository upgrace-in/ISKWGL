'use client'

import PitruPaksha from "@/Components/PitruPaksha"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PitruPaksha {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}