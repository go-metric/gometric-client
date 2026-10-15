import type { Metadata } from "next"
import { Planner } from "@/components/dashboard/planner"

export const metadata: Metadata = { title: "Planner" }

export default function PlannerPage() {
  return <Planner />
}
