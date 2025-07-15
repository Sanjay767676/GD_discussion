import { useState } from "react";
import Navigation, { TabNavigation } from "@/components/navigation";
import SchedulePage from "./schedule";
import JoinSessionPage from "./join-session";
import SummaryPage from "./summary";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"schedule" | "join" | "summary">("schedule");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === "schedule" && <SchedulePage />}
        {activeTab === "join" && <JoinSessionPage />}
        {activeTab === "summary" && <SummaryPage />}
      </div>
    </div>
  );
}
