import { Stylist } from "@repo/salon-domain";
import StylistCard from "./StylistCard";

interface StylistListProps {
  stylists: Stylist[];
  salonId: string;
}

export default function StylistList({ stylists, salonId }: StylistListProps) {
  if (stylists.length === 0) {
    return (
      <div className="text-center py-xl">
        <p className="text-fg-muted text-lg">
          Noch keine Stylisten vorhanden. Füge deinen ersten Stylisten hinzu!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
      {stylists.map((stylist) => (
        <StylistCard key={stylist.id} stylist={stylist} salonId={salonId} />
      ))}
    </div>
  );
}
