import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
const CreateCompany = dynamic(() => import('@/components/ui/Company/Company'));
const ManageCompanyList = dynamic(() => import('@/components/ui/ManageCompanyList/ManageCompanyList'));

const page = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
        <CreateCompany/>
        <ManageCompanyList/>
    </Suspense>
  )
}

export default page