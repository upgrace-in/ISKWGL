'use client'

import RathYatra from "@/Components/RathYatra"

export default function Page({ params }) {
    return <RathYatra {...params} defaultReferral={"facebook"} />
}