'use client'

import CreateQuestion from "../../new/CreateQuestion.jsx";
import { useParams } from 'next/navigation'

const page = () => {
  const params = useParams();

  return (
    <CreateQuestion params={params}/>
  )
}

export default page;
