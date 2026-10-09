"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/shadcnui/badge";
import { Button } from "@/components/shadcnui/button";
import { Card } from "@/components/shadcnui/card";
import { Input } from "@/components/shadcnui/input";

export type TaxonomyItem = { id: string; name: string; count: number };

const TaxonomyManager = ({
  categories,
  tags,
}: {
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
}) => {
  const router = useRouter();
  const [categoryName, setCategoryName] = useState("");
  const [tagName, setTagName] = useState("");

  const create = async (kind: string, name: string) => {
    if (name.trim() === "") {
      return;
    }
    await fetch("/api/admin/taxonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, name: name.trim() }),
    });
    setCategoryName("");
    setTagName("");
    router.refresh();
  };

  const remove = async (kind: string, id: string) => {
    await fetch("/api/admin/taxonomy", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, id }),
    });
    router.refresh();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="pb-3 text-lg font-semibold">Categories</h2>
        <div className="flex gap-2 pb-4">
          <Input
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="New category"
            aria-label="New category"
            autoComplete="off"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => create("category", categoryName)}>
            <Plus />
            Add
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between gap-2 border-b py-2 text-sm last:border-0">
              <span className="font-medium">{category.name}</span>
              <span className="flex items-center gap-2">
                <Badge variant="secondary">{category.count} products</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Delete ${category.name}`}
                  onClick={() => remove("category", category.id)}>
                  <Trash2 />
                </Button>
              </span>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-6">
        <h2 className="pb-3 text-lg font-semibold">Tags</h2>
        <div className="flex gap-2 pb-4">
          <Input
            value={tagName}
            onChange={(event) => setTagName(event.target.value)}
            placeholder="New tag"
            aria-label="New tag"
            autoComplete="off"
          />
          <Button
            type="button"
            size="sm"
            onClick={() => create("tag", tagName)}>
            <Plus />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 py-1">
              {tag.name} ({tag.count})
              <button
                type="button"
                aria-label={`Delete ${tag.name}`}
                onClick={() => remove("tag", tag.id)}
                className="hover:text-destructive ml-1">
                <Trash2 className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TaxonomyManager;
