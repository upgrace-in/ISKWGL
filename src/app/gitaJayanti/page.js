'use client'

import GitaJayanti from "@/Components/GitaJayanti"

export default function Page({ params }) {
    return <GitaJayanti {...params} defaultReferral={"facebook"} />
}