import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to user dashboard as main entry point
  redirect("/user")
}