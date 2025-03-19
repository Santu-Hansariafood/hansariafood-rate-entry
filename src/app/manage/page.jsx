import CreateCompany from '@/components/ui/Company/Company'
import ManageCompanyList from '@/components/ui/ManageCompanyList/ManageCompanyList'
import React from 'react'

const page = () => {
  return (
    <div>
        <CreateCompany/>
        <ManageCompanyList/>
    </div>
  )
}

export default page