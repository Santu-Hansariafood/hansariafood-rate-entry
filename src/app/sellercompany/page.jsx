import React from 'react'
import CreateSeller from '@/components/ui/Seller/CreateSeller/CreateSeller';
import SellerList from '@/components/ui/Seller/SellerList/SellerList';

const page = () => {
  return (
    <div>
      <CreateSeller />
      <SellerList />
    </div>
  )
}

export default page