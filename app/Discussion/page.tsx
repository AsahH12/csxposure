import React, { Suspense } from "react";
import DiscussionPage from "../Components/DiscussionPage"; // Your actual page component

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DiscussionPage />
    </Suspense>
  );
}
