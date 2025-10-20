import React from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/router'
const Page = () => {
    const attemptId = "12345"; // Replace with dynamic ID if needed
  
    return (
      <div>
        <h1>Page</h1>
        <Link href={`/admin/assignment/attempt-details/${attemptId}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
            Go to Attempt {attemptId}
          </button>
        </Link>
      </div>
    );
  };
  
  export default Page;