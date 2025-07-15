import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Download, Clock, MessageSquare, Users, FileText } from "lucide-react";

interface ParticipantFeedback {
  name: string;
  overallScore: number;
  clarity: number;
  engagement: number;
  analysis: number;
  strengths: string[];
  improvements: string[];
}

interface FeedbackData {
  overallSummary: string;
  participantFeedback: ParticipantFeedback[];
}

interface SessionStats {
  duration: string;
  totalMessages: number;
  totalParticipants: number;
  completedAt: string;
}

interface FeedbackReportProps {
  feedback: FeedbackData;
  sessionStats: SessionStats;
  transcript: Array<{ speaker: string; message: string; timestamp: string }>;
  onDownloadReport: () => void;
}

export default function FeedbackReport({ 
  feedback, 
  sessionStats, 
  transcript, 
  onDownloadReport 
}: FeedbackReportProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Overview */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Session Summary</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                Completed: {sessionStats.completedAt}
              </span>
              <Button onClick={onDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="text-blue-600 w-5 h-5 mr-2" />
                <span className="text-sm font-medium text-blue-900">Duration</span>
              </div>
              <p className="text-2xl font-bold text-blue-700 mt-1">{sessionStats.duration}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <MessageSquare className="text-green-600 w-5 h-5 mr-2" />
                <span className="text-sm font-medium text-green-900">Messages</span>
              </div>
              <p className="text-2xl font-bold text-green-700 mt-1">{sessionStats.totalMessages}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <Users className="text-purple-600 w-5 h-5 mr-2" />
                <span className="text-sm font-medium text-purple-900">Participants</span>
              </div>
              <p className="text-2xl font-bold text-purple-700 mt-1">{sessionStats.totalParticipants}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI-Generated Feedback */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <Brain className="text-primary w-5 h-5 inline mr-2" />
            AI-Generated Feedback
          </h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Overall Discussion Quality</h3>
            <p className="text-gray-700">{feedback.overallSummary}</p>
          </div>

          {/* Individual Participant Feedback */}
          <div className="space-y-6">
            {feedback.participantFeedback.map((participant, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="text-blue-600 w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{participant.name}</h4>
                      <p className="text-sm text-gray-600">Participant</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(participant.overallScore)}`}>
                      {participant.overallScore}/10
                    </div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(participant.clarity)}`}>
                      {participant.clarity}/10
                    </div>
                    <div className="text-sm text-gray-600">Clarity</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(participant.engagement)}`}>
                      {participant.engagement}/10
                    </div>
                    <div className="text-sm text-gray-600">Engagement</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${getScoreColor(participant.analysis)}`}>
                      {participant.analysis}/10
                    </div>
                    <div className="text-sm text-gray-600">Analysis</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Strengths</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {participant.strengths.map((strength, i) => (
                        <li key={i}>• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Areas for Improvement</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {participant.improvements.map((improvement, i) => (
                        <li key={i}>• {improvement}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discussion Transcript */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            <FileText className="text-primary w-5 h-5 inline mr-2" />
            Discussion Transcript
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <div className="space-y-3 font-mono text-sm">
              {transcript.map((entry, index) => (
                <div key={index}>
                  <span className="text-gray-500">[{entry.timestamp}]</span>
                  <span className="font-semibold text-gray-900 ml-2">{entry.speaker}:</span>
                  <span className="text-gray-800 ml-2">{entry.message}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
