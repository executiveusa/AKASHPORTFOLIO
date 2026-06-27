import { redirect } from "next/navigation";

// Root redirect — sends to default locale dashboard
// Middleware handles locale detection before this runs
export default function RootPage() {
  redirect("/es/dashboard");
}
