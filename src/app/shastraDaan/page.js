'use client'
import { Suspense } from "react";
import ShastraDaan from "@/Components/ShastraDaan"

export default function Page({ params }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <ShastraDaan {...params} defaultReferral={"facebook"} />
        </Suspense>
    );
}