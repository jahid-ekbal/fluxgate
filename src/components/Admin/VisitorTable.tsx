"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { Field, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { timeAgo } from "@/lib/dates";

type Visit = {
  id: string;
  ip: string;
  country: string;
  vpn: boolean;
  path: string;
  createdAt: string;
};

const VisitorTable = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [countries, setCountries] = useState<
    { country: string; count: number }[]
  >([]);
  const [country, setCountry] = useState("");
  const [vpn, setVpn] = useState("");

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (country.trim() !== "") {
      params.set("country", country.trim().toUpperCase());
    }
    if (vpn !== "") {
      params.set("vpn", vpn);
    }
    const response = await fetch(`/api/visits?${params.toString()}`);
    if (!response.ok) {
      return;
    }
    const data = (await response.json()) as {
      visits: Visit[];
      countries: { country: string; _count: { country: number } }[];
    };
    setVisits(data.visits);
    setCountries(
      data.countries.map((row) => ({
        country: row.country,
        count: row._count.country,
      })),
    );
  }, [country, vpn]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {countries.map((row) => (
          <Badge
            key={row.country}
            variant="secondary">
            {row.country} ({row.count})
          </Badge>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="visit-country">Country filter</FieldLabel>
          <Input
            id="visit-country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            placeholder="US"
            autoComplete="off"
          />
        </Field>
        <Field>
          <FieldLabel>VPN filter</FieldLabel>
          <div className="flex gap-2">
            {[
              { value: "", label: "All" },
              { value: "yes", label: "VPN yes" },
              { value: "no", label: "VPN no" },
            ].map((option) => (
              <Button
                key={option.label}
                type="button"
                variant={vpn === option.value ? "default" : "outline"}
                size="sm"
                aria-pressed={vpn === option.value}
                onClick={() => setVpn(option.value)}>
                {option.label}
              </Button>
            ))}
          </div>
        </Field>
      </div>
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b">
                <th className="py-2 pr-4 font-medium">IP</th>
                <th className="py-2 pr-4 font-medium">Country</th>
                <th className="py-2 pr-4 font-medium">VPN</th>
                <th className="py-2 pr-4 font-medium">Path</th>
                <th className="py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((visit) => (
                <tr
                  key={visit.id}
                  className="border-b last:border-0">
                  <td className="py-2 pr-4">{visit.ip}</td>
                  <td className="py-2 pr-4">{visit.country}</td>
                  <td className="py-2 pr-4">
                    <Badge variant={visit.vpn ? "destructive" : "secondary"}>
                      {visit.vpn ? "yes" : "no"}
                    </Badge>
                  </td>
                  <td className="py-2 pr-4">{visit.path}</td>
                  <td className="py-2">{timeAgo(visit.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visits.length === 0 && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              No visits match
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VisitorTable;
