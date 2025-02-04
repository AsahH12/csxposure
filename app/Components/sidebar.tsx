'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';

const profilePhotoUrl = '/placeholder-profile.jpg';

const Sidebar: React.FC = () => {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <div></div>
  );
};

export default Sidebar;