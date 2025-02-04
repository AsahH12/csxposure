// page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import CardComponent from '../Components/profileCard';
import Sidebar from '../Components/sidebar';


const HomePage: React.FC = () => {
  return (
    <div className="container">
      <div className="row">
          <div className="col-md-auto">
            <Sidebar />
          </div>
          <div className="col">
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
            <CardComponent
              firstName="Jane"
              lastName="Smith"
              school="MIT"
              description="A dedicated student with a passion for technology."
            />
          </div>
        </div>
    </div>
  );
};

export default HomePage; 