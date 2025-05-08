'use client'; // Ensure it's treated as a client component

import { Bold } from "lucide-react";
import Footer from "../Components/footer";
import styles from './termsConditons.module.css';

const TermsConditions: React.FC = () => {

    return (
        <div >
            <div className={styles.background}>

                <div className={styles.card}>
                   
                    <h1 className={styles.title}>Terms and Conditions</h1>
                    <p className={styles.text} style={{ fontWeight: 'bold' }}>
                        Effective Date: 05-01-2025
                    </p>
                    <p className={styles.text}>
                        Welcome to CSXposure! These Terms and Conditions (“Terms”) govern your use of the CSXposure platform (“Site,” “Platform,” “we,” “our,” or “us”), a web application designed to help students showcase their projects and connect with real-world collaboration opportunities.
                        By accessing or using CSXposure, you agree to comply with and be bound by these Terms. If you do not agree with these Terms, you should not use the platform.
                    </p>
                   
                    <h2 className={styles.subtitle}>1. Acceptance of Terms</h2>
                    <p className={styles.text}>
                        By accessing or using csXposure, you agree to be bound by these terms and conditions. If you do not agree, please refrain from using our services.
                    </p>
                   
                    <h2 className={styles.subtitle}>2. Eligibility</h2>
                    <p className={styles.text}>
                        You must be at least 13 years of age to use CSXposure. By creating an account, you represent that you meet this requirement and have the legal authority to accept these Terms.
                    </p>
                   
                    <h2 className={styles.subtitle}>3. Account Registration</h2>
                    <p className={styles.text}>
                        To access certain features, you must create an account. You agree to:
                    </p>
                    <ul className={styles.list}>
                        <li>Provide accurate, current information.</li>
                        <li>Keep your login credentials secure.</li>
                        <li>Take responsibility for all activity under your account.</li>
                    </ul>
                    <p className={styles.text}>
                        CSXposure is not responsible for unauthorized access to your account.
                    </p>

                    <h2 className={styles.subtitle}>4. Acceptable Use</h2>
                    <p className={styles.text}>
                        You agree not to:
                    </p>
                    <ul className={styles.list}>
                        <li>Upload or share content that is offensive, harmful, illegal, or infringes on intellectual property rights.</li>
                        <li>Use the platform to harass, spam, or impersonate others.</li>
                        <li>Interfere with or disrupt the Site or its servers.</li>
                    </ul>
                    <p className={styles.text}>
                        We reserve the right to suspend or terminate accounts that violate these rules.
                    </p>

                    <h2 className={styles.subtitle}>5. User Content</h2>
                    <p className={styles.text}>
                        You retain ownership of the content you upload, including project descriptions, images, videos, and profile details. By uploading content to CSXposure, you grant us a non-exclusive, royalty-free license to display and distribute that content on the platform.
                    </p>
                    <p className={styles.text}>
                        You are solely responsible for your content and ensure it complies with applicable laws.
                    </p>

                    <h2 className={styles.subtitle}>6. Collaboration and Communication</h2>
                    <p className={styles.text}>
                        CSXposure provides tools such as discussion boards and direct messaging to foster collaboration. You agree to use these tools respectfully and understand that we do not monitor or endorse specific collaborations, users, or opportunities. Participation in projects or external arrangements is at your own risk.
                    </p>

                    <h2 className={styles.subtitle}>7. Intellectual Property</h2>
                    <p className={styles.text}>
                        All software, designs, and branding associated with CSXposure are our property or that of our licensors. You may not reproduce, distribute, or modify any part of the platform without express written permission.
                    </p>

                    <h2 className={styles.subtitle}>8. Platform Availability and Limitations</h2>
                    <p className={styles.text}>
                        CSXposure is provided on an “as is” and “as available” basis. We may modify, suspend, or discontinue parts of the platform at any time without notice. We do not guarantee uninterrupted access or error-free functionality.
                    </p>

                    <h2 className={styles.subtitle}>9. Termination</h2>
                    <p className={styles.text}>
                        We may suspend or terminate your account at our discretion, with or without notice, if you violate these Terms or act in a manner that harms the community.
                    </p>
                    <p className={styles.text}>
                        You may delete your account at any time by contacting support or through your user settings.
                    </p>

                    <h2 className={styles.subtitle}>10. Limitation of Liability</h2>
                    <p className={styles.text}>
                        CSXposure is not liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform, including interactions with other users or reliance on shared content.
                    </p>

                    <h2 className={styles.subtitle}>11. Governing Law</h2>
                    <p className={styles.text}>
                        These Terms are governed by the laws of the State of [Insert State], without regard to conflict of law principles.
                    </p>

                    <h2 className={styles.subtitle}>12. Changes to These Terms</h2>
                    <p className={styles.text}>
                        We may update these Terms periodically. Continued use of the platform after updates constitutes acceptance of the revised Terms. We encourage you to review them regularly.
                    </p>

                    <h2 className={styles.subtitle}>13.  Contact</h2>
                    <p className={styles.text}>
                        For questions or concerns about these Terms, please contact us at:
                    </p>
                    <p className={styles.text}>
                        Email: CSXposure@gmail.com
                    </p>
                </div>
                <Footer />

            </div>
        </div>
    );
};

export default TermsConditions;

