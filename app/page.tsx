import InfiniteGrid from "../components/hero/InfiniteGrid";
import BottomNav from "../components/ui/BottomNav";
import NavOverlays from "../components/ui/NavOverlays";
import DetailOverlay from "../components/product/DetailOverlay";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <InfiniteGrid />
      <DetailOverlay />
      <NavOverlays />
      <BottomNav />
    </main>
  );
}
