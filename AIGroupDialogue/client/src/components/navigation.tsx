import { MessageSquare } from "lucide-react";

interface NavigationProps {
  activeTab: "schedule" | "join" | "summary";
  onTabChange: (tab: "schedule" | "join" | "summary") => void;
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <MessageSquare className="text-primary text-2xl mr-3" />
            <span className="text-xl font-bold text-gray-900">AI Group Discussion</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-primary transition-colors">
              <i className="fas fa-user-circle text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface TabNavigationProps {
  activeTab: "schedule" | "join" | "summary";
  onTabChange: (tab: "schedule" | "join" | "summary") => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: "schedule", label: "Schedule Session", icon: "fas fa-calendar-plus" },
    { id: "join", label: "Join Session", icon: "fas fa-users" },
    { id: "summary", label: "Session Summary", icon: "fas fa-chart-line" }
  ];

  return (
    <div className="mb-8">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as "schedule" | "join" | "summary")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
