'use client'

import Janmashtami from "@/Components/Janmashtami"

export default function Page({ searchParams }) {
    //const searchParams = useSearchParams(); 
    const defaultValueParam = parseInt(searchParams.defaultValue, 10); // ✅ just access it as a property

    return <Janmashtami  defaultValue={defaultValueParam}/>
}