'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';

const Sidebar: React.FC = () => {
  useEffect(() => {
    import('bootstrap/dist/js/bootstrap.bundle.min');
  }, []);

  return (
    <div>
        <button className="btn btn-primary">Button</button>
    </div>
  );
};

export default Sidebar;