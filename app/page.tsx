import PorscheAdBuilder from "@/components/porsche-ad-builder";
import Header from "@/components/header";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      <PorscheAdBuilder />
    </div>
  );
}
