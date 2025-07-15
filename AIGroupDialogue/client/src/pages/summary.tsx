import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import FeedbackReport from "@/components/feedback-report";
import { Card, CardContent } from "@/components/ui/card";
import { generateFeedback } from "@/lib/gemini";
import { useState, useEffect } from "react";

export default function SummaryPage() {
  const [match, params] = useRoute("/summary/:sessionId");
  const [feedback, setFeedback] = useState<any>(null);
  const sessionId = params?.sessionId;

  const { data: sessionData } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  const { data: transcriptData } = useQuery({
    queryKey: ["/api/sessions", sessionId, "transcript"],
    enabled: !!sessionId,
  });

  // Generate feedback when session and transcript data are available
  useEffect(() => {
    if (!sessionData || !transcriptData) return;

    const generateSessionFeedback = async () => {
      const feedbackData = await generateFeedback(
        sessionData.topic,
        transcriptData,
        sessionData.participants || []
      );
      setFeedback(feedbackData);
    };

    generateSessionFeedback();
  }, [sessionData, transcriptData]);

  const handleDownloadReport = () => {
    const reportData = {
      session: sessionData,
      feedback,
      transcript: transcriptData
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-report-${sessionId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!sessionId) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Session</h1>
            <p className="text-gray-600">Please check the session link and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!sessionData || !feedback) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Generating Report...</h1>
            <p className="text-gray-600">Please wait while we analyze the session data.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sessionStats = {
    duration: sessionData.duration || "00:00",
    totalMessages: transcriptData?.length || 0,
    totalParticipants: sessionData.participants?.length || 0,
    completedAt: sessionData.completedAt || new Date().toISOString()
  };

  return (
    <FeedbackReport
      feedback={feedback}
      sessionStats={sessionStats}
      transcript={transcriptData || []}
      onDownloadReport={handleDownloadReport}
    />
  );
}
