import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Send, User, Bot, Clock, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  speaker: string;
  message: string;
  timestamp: Date;
  isAi: boolean;
  aiPersonality?: "confident" | "emotional" | "data-driven";
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  onEndSession: () => void;
  sessionDuration: string;
  isActive: boolean;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage, 
  onEndSession, 
  sessionDuration,
  isActive 
}: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-speak AI messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.isAi && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(lastMessage.message);
      utterance.rate = 0.9;
      utterance.pitch = lastMessage.aiPersonality === 'confident' ? 1.1 : 
                       lastMessage.aiPersonality === 'emotional' ? 0.9 : 1.0;
      
      setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      speechSynthesis.speak(utterance);
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      onSendMessage(messageInput.trim());
      setMessageInput("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const toggleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isListening) {
        recognition.start();
        setIsListening(true);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setMessageInput(transcript);
          setIsListening(false);
          
          toast({
            title: "Voice captured",
            description: "Your message has been converted to text",
          });
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          console.error('Speech recognition error:', event.error);
          toast({
            title: "Voice input error",
            description: "Could not access microphone or process speech",
            variant: "destructive",
          });
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        recognition.stop();
        setIsListening(false);
      }
    } else {
      toast({
        title: "Voice input not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const getMessageBg = (message: Message) => {
    if (!message.isAi) {
      return "bg-blue-50";
    }
    
    const colors = {
      confident: "bg-purple-50",
      emotional: "bg-pink-50",
      "data-driven": "bg-green-50"
    };
    
    return colors[message.aiPersonality!] || "bg-gray-50";
  };

  const getAvatarBg = (message: Message) => {
    if (!message.isAi) {
      return "bg-blue-100";
    }
    
    const colors = {
      confident: "bg-purple-100",
      emotional: "bg-pink-100",
      "data-driven": "bg-green-100"
    };
    
    return colors[message.aiPersonality!] || "bg-gray-100";
  };

  const getAvatarIcon = (message: Message) => {
    if (!message.isAi) {
      return <User className="text-blue-600 w-4 h-4" />;
    }
    
    const colors = {
      confident: "text-purple-600",
      emotional: "text-pink-600",
      "data-driven": "text-green-600"
    };
    
    return <Bot className={`${colors[message.aiPersonality!]} w-4 h-4`} />;
  };

  return (
    <div className="space-y-4">
      <Card className="h-96 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start space-x-3">
                <div className={`w-8 h-8 ${getAvatarBg(message)} rounded-full flex items-center justify-center flex-shrink-0`}>
                  {getAvatarIcon(message)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{message.speaker}</span>
                    <span className="text-xs text-gray-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className={`${getMessageBg(message)} rounded-lg p-3`}>
                    <p className="text-sm text-gray-800">{message.message}</p>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1"
                disabled={!isActive}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVoiceInput}
                className={isListening ? "text-red-500" : "text-gray-500"}
                disabled={!isActive}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              {isSpeaking && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stopSpeaking}
                  className="text-orange-500"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={handleSendMessage} disabled={!messageInput.trim() || !isActive}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Duration: {sessionDuration}</span>
        </div>
        <Button variant="destructive" onClick={onEndSession} disabled={!isActive}>
          <StopCircle className="w-4 h-4 mr-2" />
          End Session
        </Button>
      </div>
    </div>
  );
}
