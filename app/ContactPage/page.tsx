'use client'; // Ensure it's treated as a client component

import { Bold } from "lucide-react";
import Footer from "../Components/footer";
import styles from './contact.module.css';
import cardstyles from '../Home/profileCard.module.css'; // Import the card styles

const Contact: React.FC = () => {

    type SimpleCardProps = {
        name: string;
        bio: string;
        school: string;
        profileImageUrl?: string;
      };
      
      const SimpleCardComponent: React.FC<SimpleCardProps> = ({ name, bio, school, profileImageUrl }) => {
        const truncatedBio = bio.length > 60 ? bio.slice(0, 60) + '...' : bio;
      
        return (
          <div className={cardstyles.card}>
            <div className={cardstyles.cardBody}>
              <div className={cardstyles.profileImageContainer}>
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className={cardstyles.profileImage} />
                ) : (
                  <span className={cardstyles.initials}>
                    {name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                )}
              </div>
              <h5 className={cardstyles.cardTitle}>{name}</h5>
              <h6 className={cardstyles.cardSubtitle}>{school}</h6>
              <p className={cardstyles.cardText}>{truncatedBio}</p>
            </div>
          </div>
        );
      };
      

    return (
        <div >
            <div className={styles.background}>
             <h1 className={styles.title}>Contact</h1>
                <div className={styles.card}>
                    <p className={styles.text}>
                        For all support questions, feature suggestions, or general platform feedback, please contact us at: <br />
                        Main Email:  [CSXposure@gmail.com] <br />
                        We aim to respond within 2–3 business days.
                    </p>
                    <h2 className={styles.subtitle}>Meet the Developers</h2>
                    <p className={styles.text}>
                        CSXposure is built by a team of passionate student developers committed to creating a space where student innovation thrives. You can also reach out to us individually:
                    </p>

                    <div className={styles.developerCards}>
                        <SimpleCardComponent
                            name="Asah Hayes"
                            bio="Creative developer with a passion for accessible and elegant interfaces."
                            school="Backend Developer"
                        />
                        <SimpleCardComponent
                            name="Huy Vu"
                            bio="Creative developer with a passion for accessible and elegant interfaces."
                            school="Full Stack Developer"
                        />
                        <SimpleCardComponent
                            name="Payton de Veyra"
                            bio="Creative developer with a passion for accessible and elegant interfaces."
                            school="Full Stack Developer"
                        />
                    </div>

                    <p className={styles.text} style={{ marginTop: '25px' }}>
                        Please contact us individually for specific development-related questions or if you're interested in collaborating on future features.
                    </p>
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default Contact;

