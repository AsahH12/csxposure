import { Suspense } from "react";
import ProjectEditClient from "../Components/ProjectEditPage";

const ProjectEditPage = () => {
  return (
    <div>
      <h1>Edit Project</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProjectEditClient />
      </Suspense>
    </div>
  );
};

export default ProjectEditPage;
