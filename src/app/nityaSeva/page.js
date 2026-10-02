'use client'

import NityaSeva from "@/Components/NityaSeva"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NityaSeva {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}