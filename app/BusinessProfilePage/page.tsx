'use client';

import { Suspense } from 'react';
import BusinessProfilePage from '../Components/BuisnessProfilePage';

const BusinessProfilePageWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BusinessProfilePage />
    </Suspense>
  );
};

export default BusinessProfilePageWrapper;
