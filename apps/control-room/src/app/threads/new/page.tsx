import { Suspense } from "react";
import { NewThreadContent } from "./NewThreadContent";

export default function NewThreadPage() {
  return (
    <Suspense>
      <NewThreadContent />
    </Suspense>
  );
}
