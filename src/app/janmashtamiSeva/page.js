'use client'

import Janmashtami from "@/Components/Janmashtami"
import { Suspense } from "react";
export default function Page({ searchParams }) {
    //const searchParams = useSearchParams(); 
    const defaultValueParam = parseInt(searchParams.defaultValue, 10); // ✅ just access it as a property

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Janmashtami  defaultValue={defaultValueParam}/>
        </Suspense>
    )
}