'use client'

import GitaJayanti from "@/Components/GitaJayanti"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GitaJayanti {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}