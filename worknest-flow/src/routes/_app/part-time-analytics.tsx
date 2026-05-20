import { createFileRoute } from "@tanstack/react-router";
import PartTimeAnalytics from "@/pages/part-time-analytics";

export const Route = createFileRoute("/_app/part-time-analytics")({
  component: PartTimeAnalytics,
});
