import dynamic from 'next/dynamic'
import React from 'react'
import AuthWrapper from '@/components/AuthWrapper/AuthWrapper'
const UnauthorizedPage = dynamic(() => import('@/components/ui/Unauthorized/Unauthorized'));

const page = () => {
  return (
    <AuthWrapper>
      <section role="region" aria-label="unauthorized">
        <UnauthorizedPage />
      </section>
    </AuthWrapper>
  )
}

export default page