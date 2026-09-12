'use client'

import Radhastami from "@/Components/Radhastami"

export default function Page({ params }) {
    return <Radhastami {...params} defaultReferral={"facebook"} />
}