// page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import CardComponent from '../Components/profileCard';


const HomePage: React.FC = () => {
  return (
<div>
      <CardComponent
        firstName="John"
        lastName="Doe"
        school="Harvard University"
        description="A passionate student with a love for learning."
      />
      <CardComponent
        firstName="Emily"
        lastName="Underwood"
        school="Stanford University"
        description="An enthusiastic learner with a focus on computer science."
      />
    </div>
);
};

export default HomePage; 