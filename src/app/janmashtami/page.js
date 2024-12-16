'use client'

import Janmashtami from "@/Components/Janmashtami"

export default function Page({ params }) {
    return <Janmashtami {...params} defaultReferral={"facebook"} />
}