'use client'

import KartikMonth from "@/Components/KartikMonth"

export default function Page({ params }) {
    return <KartikMonth {...params} defaultReferral={"facebook"} />
}