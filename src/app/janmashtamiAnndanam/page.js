'use client'

import JanmastamiAnnadanam from "@/Components/JanmastamiAnnadanam"
import { Suspense } from "react";
export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JanmastamiAnnadanam {...params} defaultReferral={"facebook"} />
        </Suspense>
    )
}