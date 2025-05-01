# CSXposure

Showcasing and Connecting Students Through Projects and Discussions

# Overview

CSXposure is a platform designed to connect students, showcase their projects, and facilitate working and helping each other. The application allows users to search for student profiles, communicate with the student, participate in discussions.

# Features

- **Search and Filter:** Find students by name and filter by school
- **User Profiles:** View profiles with bios, school details, and project descriptions
- **Discussion Board:** Request help or enlist a student to do a volunteer work project
- **Project Catagories:** Browse by websites, apps and games

# Tech Stack
- **Frontend:** Next.js, React, TypeScript, Boostrap, CSS Modules
- **Backend:** Firebase Firestore for database
- **Authentication:** Firebase Auth

# Data Sources
CSXposure uses the following external API to enhance search functionality:  

- **University API**: Provides a list of universities, which is used for the school name autocomplete feature.  
  - **Endpoint:** [University API](https://www.postman.com/api-evangelist/universities/example/35240-f8b16d47-c94c-40fa-b70c-5500ec828b17)  

# Installation
1. Clone the repository:
      ```bash
      git clone https://github.com/your-username/CSXposure.git
      cd CSXposure
      ```

2. Install dependencies:
      ```bash
      npm install
      ```

3. Configure Firebase:
   - Create a `.env.local` file and add Firebase credentials.
   - Ensure `firebaseconfig.ts` is set up correctly
   
5. Run the project:
      ```bash
      npm run dev
      ```
      Open http://localhost:3000 in your browser.

# Project Status
CSXposure is currently in **Pre-Alpha** stage. We are still implementing all the key features and functionalities for the app to work.

# Authors and acknowledgment
Asah Hayes, Huy Vu, Payton de Veyra

## License

[MIT](https://choosealicense.com/licenses/mit/)
