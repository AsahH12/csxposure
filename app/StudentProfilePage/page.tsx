'use client';

import { Suspense } from 'react';
import StudentProfilePage from '../Components/StudentProfilePage';

const StudentProfilePageWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StudentProfilePage />
    </Suspense>
  );
};

export default StudentProfilePageWrapper;
