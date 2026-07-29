import { BroadcastForm } from "@/components/admin/BroadcastForm";

export default function AdminBroadcastPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Съобщение до всички участнички</h1>
      <BroadcastForm />
    </div>
  );
}
