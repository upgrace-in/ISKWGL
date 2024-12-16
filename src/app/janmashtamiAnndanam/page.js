'use client'

import JanmastamiAnnadanam from "@/Components/JanmastamiAnnadanam"

export default function Page({ params }) {
    return <JanmastamiAnnadanam {...params} defaultReferral={"facebook"} />
}