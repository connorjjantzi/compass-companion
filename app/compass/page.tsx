import CompassDataTable from "@/components/compass-data-table";
import { api } from "@/trpc/server";

export default async function CompassPage() {
  const leagues = (await api.league.getLeagues.query()).leagues.filter(
    (league) =>
      !league.rules.some(
        (rule) => rule.id === "NoParties" || rule.id === "HardMode",
      ),
  );

  return <CompassDataTable leagues={leagues} />;
}
