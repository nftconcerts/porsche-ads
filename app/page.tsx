import PAdBuilder from "@/components/p-ad-builder";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <PAdBuilder />
    </div>
  );
}
