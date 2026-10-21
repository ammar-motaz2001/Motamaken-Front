"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import type { City } from "@/lib/api/types";

/** Cities of the chosen country from GET /countries/{id}/cities; an empty list while none is chosen or on error. */
export function useCities(countryId: string) {
  const [cities, setCities] = useState<{ countryId: string; list: City[] }>({ countryId: "", list: [] });

  useEffect(() => {
    if (!countryId) return;
    let cancelled = false;
    api<{ data: City[] }>(`/countries/${countryId}/cities`)
      .then((result) => !cancelled && setCities({ countryId, list: result.data }))
      .catch(() => !cancelled && setCities({ countryId, list: [] }));
    return () => {
      cancelled = true;
    };
  }, [countryId]);

  return countryId && cities.countryId === countryId ? cities.list : [];
}
