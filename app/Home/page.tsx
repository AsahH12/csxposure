// page.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import CardComponent from '../Components/profileCard';


const HomePage: React.FC = () => {
  return (
//     <div className="card" style={{ width: '18rem', margin: 'auto', marginTop: '20px' }}>
//   <img className="card-img-top" src="..." alt="Card image cap" />
//   <div className="card-body">
//     <h5 className="card-title">Name</h5>
//     <p className="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
//     <a href="#" className="btn btn-primary">Go somewhere</a>
//   </div>
// </div>
<div>
      <CardComponent
        firstName="John"
        lastName="Doe"
        school="Harvard University"
        description="A passionate student with a love for learning."
        profileImageUrl="/path/to/image.jpg"
      />
      <CardComponent
        firstName="Jane"
        lastName="Smith"
        school="Stanford University"
        description="An enthusiastic learner with a focus on computer science."
      />
    </div>
);
};

export default HomePage; 