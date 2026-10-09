import VisitorTable from "@/components/Admin/VisitorTable";

export const metadata = { title: "Admin visitors" };

const AdminVisitorsPage = async () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">Visitors</h1>
        <p className="text-muted-foreground">
          Self-hosted tracking, country from locale, VPN by proxy headers
        </p>
      </div>
      <VisitorTable />
    </div>
  );
};

export default AdminVisitorsPage;
