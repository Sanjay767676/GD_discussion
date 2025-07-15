import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { collection, doc, onSnapshot, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ChatInterface from "@/components/chat-interface";
import ParticipantList from "@/components/participant-list";
import { Card, CardContent } from "@/components/ui/card";
import { generateAIResponse, AI_PERSONALITIES } from "@/lib/gemini";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function JoinSessionPage() {
  const [match, params] = useRoute("/join/:sessionId");
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [sessionDuration, setSessionDuration] = useState("00:00");

  const sessionId = params?.sessionId;

  // Fetch session data
  const { data: sessionData } = useQuery({
    queryKey: ["/api/sessions", sessionId],
    enabled: !!sessionId,
  });

  // Fetch participants data
  const { data: participantsData } = useQuery({
    queryKey: ["/api/sessions", sessionId, "participants"],
    enabled: !!sessionId,
  });

  // Fetch messages data
  const { data: messagesData } = useQuery({
    queryKey: ["/api/sessions", sessionId, "messages"],
    enabled: !!sessionId,
    refetchInterval: 2000, // Refresh every 2 seconds for real-time feel
  });

  // Set up Firebase real-time listeners if available, otherwise use API data
  useEffect(() => {
    if (!sessionId) return;

    if (db) {
      try {
        const messagesRef = collection(db, "sessions", sessionId, "messages");
        const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          }));
          setMessages(newMessages);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up message listener:", error);
      }
    } else {
      // Use API data if Firebase is not available
      if (messagesData) {
        setMessages(messagesData.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    }
  }, [sessionId, messagesData]);

  useEffect(() => {
    if (!sessionId) return;

    if (db) {
      try {
        const participantsRef = collection(db, "sessions", sessionId, "participants");
        const unsubscribe = onSnapshot(participantsRef, (snapshot) => {
          const newParticipants = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setParticipants(newParticipants);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error setting up participants listener:", error);
      }
    } else {
      // Use API data if Firebase is not available
      if (participantsData) {
        setParticipants(participantsData);
      }
    }
  }, [sessionId, participantsData]);

  // Set session data
  useEffect(() => {
    if (sessionData) {
      setSession(sessionData);
    }
  }, [sessionData]);

  // Session duration timer
  useEffect(() => {
    if (!session?.startedAt) return;

    const timer = setInterval(() => {
      const now = new Date();
      const startTime = new Date(session.startedAt);
      const diff = now.getTime() - startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setSessionDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, speaker }: { message: string; speaker: string }) => {
      if (db) {
        const messagesRef = collection(db, "sessions", sessionId!, "messages");
        await addDoc(messagesRef, {
          message,
          speaker,
          timestamp: new Date(),
          isAi: false
        });
      } else {
        // Fallback to API if Firebase is not available
        await apiRequest("POST", `/api/sessions/${sessionId}/messages`, {
          message,
          speaker,
          type: "text",
          isAi: false
        });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "messages"] });
    },
  });

  const handleSendMessage = async (message: string) => {
    if (!sessionId) return;

    await sendMessageMutation.mutateAsync({
      message,
      speaker: "You"
    });

    // Trigger AI responses
    setTimeout(() => {
      generateAIResponses(message);
    }, 2000);
  };

  const generateAIResponses = async (userMessage: string) => {
    if (!sessionId) return;

    const aiParticipants = participants.filter(p => p.type === "ai");
    const recentMessages = messages.slice(-10).map(m => `${m.speaker}: ${m.message}`);

    for (const aiParticipant of aiParticipants) {
      const personality = AI_PERSONALITIES.find(p => p.type === aiParticipant.aiPersonality);
      if (!personality) continue;

      setTimeout(async () => {
        try {
          // Use the API endpoint for generating AI responses
          const response = await apiRequest("POST", `/api/sessions/${sessionId}/ai-response`, {
            personality: personality.type,
            context: `User just said: "${userMessage}"`
          });
          
          const responseData = await response.json();
          
          // Add AI response to messages
          const aiMessageData = {
            message: responseData.response,
            speaker: personality.name,
            type: "text",
            isAi: true
          };

          if (db) {
            const messagesRef = collection(db, "sessions", sessionId, "messages");
            await addDoc(messagesRef, {
              ...aiMessageData,
              timestamp: new Date(),
              aiPersonality: personality.type
            });
          } else {
            // Fallback to API if Firebase is not available
            await apiRequest("POST", `/api/sessions/${sessionId}/messages`, aiMessageData);
          }
          
          // Invalidate queries to refresh data
          queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "messages"] });
        } catch (error) {
          console.error("Error generating AI response:", error);
        }
      }, Math.random() * 3000 + 1000); // Random delay between 1-4 seconds
    }
  };

  // Auto-generate AI responses periodically for more natural conversation
  useEffect(() => {
    if (!sessionId || !session || messages.length === 0) return;

    const interval = setInterval(async () => {
      const lastMessage = messages[messages.length - 1];
      const timeSinceLastMessage = Date.now() - new Date(lastMessage.timestamp).getTime();
      
      // Generate AI response if no message in the last 15 seconds
      if (timeSinceLastMessage > 15000 && !lastMessage.isAi) {
        const aiParticipants = participants.filter(p => p.type === "ai");
        const randomAI = aiParticipants[Math.floor(Math.random() * aiParticipants.length)];
        
        if (randomAI) {
          const personality = AI_PERSONALITIES.find(p => p.type === randomAI.aiPersonality);
          if (personality) {
            try {
              const response = await apiRequest("POST", `/api/sessions/${sessionId}/ai-response`, {
                personality: personality.type,
                context: "Continue the group discussion naturally"
              });
              
              const responseData = await response.json();
              
              const aiMessageData = {
                message: responseData.response,
                speaker: personality.name,
                type: "text",
                isAi: true
              };

              if (db) {
                const messagesRef = collection(db, "sessions", sessionId, "messages");
                await addDoc(messagesRef, {
                  ...aiMessageData,
                  timestamp: new Date(),
                  aiPersonality: personality.type
                });
              } else {
                await apiRequest("POST", `/api/sessions/${sessionId}/messages`, aiMessageData);
              }
              
              queryClient.invalidateQueries({ queryKey: ["/api/sessions", sessionId, "messages"] });
            } catch (error) {
              console.error("Error generating periodic AI response:", error);
            }
          }
        }
      }
    }, 20000); // Check every 20 seconds

    return () => clearInterval(interval);
  }, [sessionId, session, messages, participants, db, queryClient]);

  const handleEndSession = async () => {
    if (!sessionId) return;

    const confirmed = window.confirm("Are you sure you want to end the session?");
    if (!confirmed) return;

    await apiRequest("PATCH", `/api/sessions/${sessionId}`, {
      status: "completed",
      completedAt: new Date().toISOString()
    });

    // Redirect to summary page
    window.location.href = `/summary/${sessionId}`;
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Session Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {sessionData?.topic || "Loading..."}
              </h1>
              <p className="text-gray-600 mt-1">
                Session ID: <span className="font-mono">{sessionId}</span>
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm font-medium">Live</span>
              </div>
              <span className="text-sm text-gray-500">
                Started {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Participants Panel */}
        <div className="lg:col-span-1">
          <ParticipantList participants={participants} />
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-3">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            onEndSession={handleEndSession}
            sessionDuration={sessionDuration}
            isActive={true}
          />
        </div>
      </div>
    </div>
  );
}
