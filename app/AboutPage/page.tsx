'use client';
import React from 'react';
import Footer from '../Components/footer';
import styles from './about.module.css';

const AboutPage: React.FC = () => {
  return (
    <div>
    

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div>
            <h1 className={styles.heading}>About CSXposure</h1>
            <p className={styles.tagLine}>
              <strong>Welcome to CSXposure — A Platform Built for Student Innovation.</strong><br />
              CSXposure is a dynamic online hub designed to empower computer science students by giving them the tools to
              showcase their technical talents, collaborate with peers, and connect with real-world project opportunities.
              Whether you're a student eager to display your portfolio or a business seeking fresh tech perspectives,
              CSXposure bridges the gap between potential and opportunity.
            </p>
          </div>
          <img
            src="/logo_VerticalWhite.png"
            alt="CSXposure Logo"
            className={styles.heroLogo}
          />
        </div>
      </section>

      <section className={styles.mission}>
        <h2 className={styles.heading}>Our Mission</h2>
          <p>
            We believe every student project deserves a spotlight. At CSXposure, our mission is to create a space where
            students can turn classroom projects into career opportunities by building a digital presence, engaging in
            collaborative projects, and demonstrating their capabilities to peers and industry professionals alike.
          </p>
        </section>

        <section className={styles.why}>
          <h2 className={styles.heading}>Why CSXposure?</h2>
          <ul>
            <li><strong>Giving Students a Voice:</strong> A dedicated profile to showcase project work, technical skills, bios, and social links.</li>
            <li><strong>Encouraging Collaboration:</strong> Tools like the Request Board and discussion forums help users find collaborators and grow ideas together.</li>
            <li><strong>Building Connections:</strong> Users can engage in meaningful conversations, get noticed through weekly spotlights, and receive feedback on their work.</li>
            <li><strong>Fostering Discovery:</strong> With built-in filtering tools, finding students by school, degree, or graduate status is simple and efficient.</li>
          </ul>
        </section>

        <section className={styles.audience}>
          <h2 className={styles.heading}>Who It's For</h2>
          <p>
            <strong>Students:</strong> Primarily built for computer science students at Full Sail University but open to students across all universities. Whether you're
            looking to network, contribute, or just showcase your passion projects, CSXposure is for you.
          </p>
          <p>
            <strong>Businesses:</strong> Small businesses and startups looking to discover talent, collaborate on real-world projects, or find motivated individuals for
            voluntary tech roles.
          </p>
        </section>

        <section className={styles.features}>
          <h2 className={styles.heading}>What You Can Do</h2>
          <ul>
            <li><strong>Create and Customize Profiles:</strong> Upload profile pictures, write bios, and link your social media accounts.</li>
            <li><strong>Upload and Share Projects:</strong> Add images, videos, links, and descriptions to projects, and tag your collaborators.</li>
            <li><strong>Engage in Conversations:</strong> Use the built-in chat server to connect with other users and businesses.</li>
            <li><strong>Explore & Post on the Request Board:</strong> Start a conversation, request collaborators, and join ongoing discussions.</li>
            <li><strong>Get Noticed:</strong> Participate actively and earn a spot in our weekly spotlight features.</li>
          </ul>
        </section>

        <section className={styles.built}>
          <h2 className={styles.heading}>Built By Students, For Students</h2>
          <p>
            The CSXposure platform is being developed by students using cutting-edge tools like Next.js, Firebase, Figma, and Visual Studio Code.
            We now host the platform using Firebase Hosting, providing a fast, secure, and scalable environment to support the growing needs of our
            community. This shift reflects our commitment to professional-grade infrastructure while maintaining the same spirit of innovation and
            adaptability that drives our team.
          </p>
        </section>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
