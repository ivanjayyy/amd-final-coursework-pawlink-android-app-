import { useState, useMemo } from "react";

export interface PetReport {
  id: string;
  petName: string;
  status: "lost" | "found";
  species: string;
  breed: string;
  lastSeenLocation: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  userEmail: string;
  coordinates?: { lat: number; lng: number } | null;
}

export function useFeedFilter(reports: PetReport[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "lost" | "found"
  >("all");
  const [selectedSpecies, setSelectedSpecies] = useState<string>("all");

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesStatus =
        selectedStatus === "all" || report.status === selectedStatus;
      const matchesSpecies =
        selectedSpecies === "all" ||
        report.species.toLowerCase() === selectedSpecies.toLowerCase();

      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        report.petName.toLowerCase().includes(query) ||
        report.breed.toLowerCase().includes(query) ||
        report.lastSeenLocation.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query);

      return matchesStatus && matchesSpecies && matchesQuery;
    });
  }, [reports, searchQuery, selectedStatus, selectedSpecies]);

  return {
    searchQuery,
    setSearchQuery,
    selectedStatus,
    setSelectedStatus,
    selectedSpecies,
    setSelectedSpecies,
    filteredReports,
  };
}
