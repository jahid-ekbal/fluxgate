import prisma from "@/lib/dbClient/prisma";
import TaxonomyManager from "@/components/Admin/TaxonomyManager";

export const metadata = { title: "Admin taxonomy" };

const AdminTaxonomyPage = async () => {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-semibold tracking-tight">Taxonomy</h1>
      <TaxonomyManager
        categories={categories.map((item) => ({
          id: item.id,
          name: item.name,
          count: item._count.products,
        }))}
        tags={tags.map((item) => ({
          id: item.id,
          name: item.name,
          count: item._count.products,
        }))}
      />
    </div>
  );
};

export default AdminTaxonomyPage;
