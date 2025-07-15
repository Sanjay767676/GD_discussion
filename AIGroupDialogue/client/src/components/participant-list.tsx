import { User, Bot } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Participant {
  id: string;
  name: string;
  type: "real" | "ai";
  aiPersonality?: "confident" | "emotional" | "data-driven";
  isActive: boolean;
}

interface ParticipantListProps {
  participants: Participant[];
}

export default function ParticipantList({ participants }: ParticipantListProps) {
  const getParticipantIcon = (participant: Participant) => {
    if (participant.type === "real") {
      return <User className="text-blue-600 w-4 h-4" />;
    }
    
    const colors = {
      confident: "text-purple-600",
      emotional: "text-pink-600",
      "data-driven": "text-green-600"
    };
    
    return <Bot className={`${colors[participant.aiPersonality!]} w-4 h-4`} />;
  };

  const getParticipantBg = (participant: Participant) => {
    if (participant.type === "real") {
      return "bg-blue-100";
    }
    
    const colors = {
      confident: "bg-purple-100",
      emotional: "bg-pink-100",
      "data-driven": "bg-green-100"
    };
    
    return colors[participant.aiPersonality!];
  };

  const getPersonalityLabel = (personality?: string) => {
    const labels = {
      confident: "Confident",
      emotional: "Emotional",
      "data-driven": "Data-Driven"
    };
    return labels[personality as keyof typeof labels] || "Real User";
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="font-semibold text-gray-900 mb-4">
          Participants ({participants.length})
        </h2>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center space-x-3">
              <div className={`w-8 h-8 ${getParticipantBg(participant)} rounded-full flex items-center justify-center`}>
                {getParticipantIcon(participant)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{participant.name}</p>
                <p className="text-xs text-gray-500">
                  {participant.type === "real" ? "Participant" : getPersonalityLabel(participant.aiPersonality)}
                </p>
              </div>
              {participant.isActive && (
                <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
