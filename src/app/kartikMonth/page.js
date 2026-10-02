'use client'

import KartikMonth from "@/Components/KartikMonth"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <KartikMonth {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}