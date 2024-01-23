"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type RouterOutputs } from "@/trpc/shared";

interface SelectLeagueProps {
  leagues: RouterOutputs["league"]["getLeagues"]["leagues"];
  setSelectedLeague: React.Dispatch<React.SetStateAction<string>>;
}

export default function SelectLeague({
  leagues,
  setSelectedLeague,
}: SelectLeagueProps) {
  return (
    <Select
      onValueChange={(league) => {
        setSelectedLeague(league);
      }}
      defaultValue={leagues[2]!.id}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a League" />
      </SelectTrigger>
      <SelectContent>
        {leagues.map((league) => (
          <SelectItem key={league.id} value={league.id}>
            {league.id}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
