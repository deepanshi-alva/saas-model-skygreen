'use client'
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo } from 'react'

function page() {
    const paramms = useParams();
    // const router = useRouter();

  
    // const courseDocumentId = paramms.documentId;
    // console.log('params', courseDocumentId)
    return (
        <div>page</div>
    )
}

export default page;