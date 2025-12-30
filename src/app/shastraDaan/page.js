'use client'

import ShastraDaan from "@/Components/ShastraDaan"

export default function Page({ params }) {
    return <ShastraDaan {...params} defaultReferral={"facebook"} />
}