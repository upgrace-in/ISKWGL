'use client'

import PitruPaksha from "@/Components/PitruPaksha"

export default function Page({ params }) {
    return <PitruPaksha {...params} defaultReferral={"facebook"} />
}