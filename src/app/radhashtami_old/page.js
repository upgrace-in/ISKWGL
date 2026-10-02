'use client'

import Radhastami from "@/Components/Radhastami"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Radhastami {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}