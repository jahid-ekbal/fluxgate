"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { Field, FieldLabel } from "@/components/shadcnui/field";
import { Input } from "@/components/shadcnui/input";
import { timeAgo } from "@/lib/dates";

export type OpsCoupon = {
  id: string;
  code: string;
  percent: number;
  active: boolean;
};

export type OpsRate = { code: string; perUsd: number };

export type OpsLog = {
  id: string;
  action: string;
  target: string | null;
  detail: string | null;
  createdAt: string;
  actorName: string;
};

const OpsManager = ({
  coupons,
  rates,
  logs,
}: {
  coupons: OpsCoupon[];
  rates: OpsRate[];
  logs: OpsLog[];
}) => {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("10");
  const [edits, setEdits] = useState<Record<string, string>>({});

  const refresh = () => router.refresh();

  const saveCoupon = async () => {
    if (code.trim() === "" || Number.isNaN(Number(percent))) {
      return;
    }
    await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "coupon",
        code: code.trim(),
        percent: Number(percent),
      }),
    });
    setCode("");
    refresh();
  };

  const toggleCoupon = async (coupon: OpsCoupon) => {
    await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "coupon",
        code: coupon.code,
        percent: coupon.percent,
        active: !coupon.active,
      }),
    });
    refresh();
  };

  const deleteCoupon = async (id: string) => {
    await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "coupon-delete", id }),
    });
    refresh();
  };

  const saveRate = async (rateCode: string) => {
    const value = Number(edits[rateCode]);
    if (Number.isNaN(value) || value <= 0) {
      return;
    }
    await fetch("/api/admin/ops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "rate", code: rateCode, perUsd: value }),
    });
    refresh();
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Coupons</h2>
        <Card className="flex flex-wrap items-end gap-2 p-4">
          <Field>
            <FieldLabel htmlFor="coupon-code">Code</FieldLabel>
            <Input
              id="coupon-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="EKBAL30"
              autoComplete="off"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="coupon-percent">Percent</FieldLabel>
            <Input
              id="coupon-percent"
              type="number"
              min="1"
              max="100"
              value={percent}
              onChange={(event) => setPercent(event.target.value)}
            />
          </Field>
          <Button
            type="button"
            size="sm"
            onClick={saveCoupon}>
            <Plus />
            Save
          </Button>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">
                  {coupon.code} ({coupon.percent}%)
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant={coupon.active ? "default" : "secondary"}>
                    {coupon.active ? "active" : "off"}
                  </Badge>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => toggleCoupon(coupon)}>
                    Toggle
                  </Button>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label={`Delete ${coupon.code}`}
                    onClick={() => deleteCoupon(coupon.id)}>
                    <Trash2 />
                  </Button>
                </span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Fallback rates (per USD)</h2>
        <Card className="p-4">
          <div className="flex flex-col gap-2">
            {rates.map((rate) => (
              <div
                key={rate.code}
                className="flex items-center gap-2 text-sm">
                <span className="w-16 font-medium">{rate.code}</span>
                <Input
                  value={edits[rate.code] ?? String(rate.perUsd)}
                  onChange={(event) =>
                    setEdits((prev) => ({
                      ...prev,
                      [rate.code]: event.target.value,
                    }))
                  }
                  type="number"
                  step="any"
                  min="0"
                  aria-label={`${rate.code} rate`}
                  className="max-w-40"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => saveRate(rate.code)}>
                  Save
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Audit log</h2>
        <Card className="p-6">
          <div className="flex flex-col gap-2">
            {logs.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
                <span>
                  <span className="font-medium">{entry.actorName}</span>{" "}
                  {entry.action}
                  {entry.target ? ` ${entry.target}` : ""}
                  {entry.detail ? ` (${entry.detail})` : ""}
                </span>
                <span className="text-muted-foreground text-xs">
                  {timeAgo(entry.createdAt)}
                </span>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="text-muted-foreground text-sm">No activity yet</p>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default OpsManager;
