'use client'; // Ensure it's treated as a client component

import Footer from "../Components/footer"; 
import styles from './termsConditions.module.css'; 


const Dashboard: React.FC = () => {

  return (
    <div >
        <div className={styles.background}>
            <h1 className={styles.title}>Terms and Conditions</h1>
            <p className={styles.text}>
                Welcome to csXposure! By using our platform, you agree to comply with the following terms and conditions. Please read them carefully.
            </p>
            <h2 className={styles.subtitle}>1. Acceptance of Terms</h2>
            <p className={styles.text}>
                By accessing or using csXposure, you agree to be bound by these terms and conditions. If you do not agree, please refrain from using our services.
            </p>
            <h2 className={styles.subtitle}>2. User Responsibilities</h2>
            <p className={styles.text}>
                Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.
            </p>
            <h2 className={styles.subtitle}>3. Content Ownership</h2>
            <p className={styles.text}>
                All content shared on csXposure remains the property of the original creator. By sharing content, you grant us a non-exclusive license to use it for promotional purposes.
            </p>
            <h2 className={styles.subtitle}>4. Prohibited Activities</h2>
            </div>
        <Footer/>
    </div>
  );
};

export default Dashboard;

