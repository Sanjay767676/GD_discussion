import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Clock, Users, Bot, CheckCircle, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sessionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  topic: z.string().min(1, "Topic is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  aiCount: z.number().min(1).max(5),
  realCount: z.number().min(1).max(6),
});

type SessionFormData = z.infer<typeof sessionSchema>;

const topics = [
  "Impact of AI on Jobs",
  "Climate Change Solutions",
  "Remote Work vs Office Work",
  "Social Media Regulation",
  "Healthcare Technology",
];

interface SessionFormProps {
  onSubmit: (data: SessionFormData) => void;
  isLoading?: boolean;
}

export default function SessionForm({ onSubmit, isLoading }: SessionFormProps) {
  const [joinLink, setJoinLink] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      name: "",
      topic: "",
      date: "",
      time: "",
      aiCount: 2,
      realCount: 3,
    },
  });

  const handleSubmit = async (data: SessionFormData) => {
    try {
      await onSubmit(data);
      // Generate mock join link for demo
      const sessionId = Math.random().toString(36).substring(2, 8);
      const link = `${window.location.origin}/join/${sessionId}`;
      setJoinLink(link);
      setShowSuccess(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(joinLink);
    toast({
      title: "Link copied",
      description: "Join link has been copied to clipboard",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Schedule New Group Discussion</h1>
            <p className="text-gray-600">Create a new GD session with AI participants and generate a join link</p>
          </div>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter your name"
                className="mt-1"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="topic">Discussion Topic</Label>
              <Select onValueChange={(value) => form.setValue("topic", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic} value={topic}>
                      {topic}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.topic && (
                <p className="text-red-500 text-sm mt-1">{form.formState.errors.topic.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...form.register("date")}
                  className="mt-1"
                />
                {form.formState.errors.date && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.date.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  {...form.register("time")}
                  className="mt-1"
                />
                {form.formState.errors.time && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.time.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aiCount">AI Participants</Label>
                <Select onValueChange={(value) => form.setValue("aiCount", parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="2" />
                  </SelectTrigger>
                  <SelectContent>
                    {[2, 3, 4, 5].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="realCount">Real Users (Max)</Label>
                <Select onValueChange={(value) => form.setValue("realCount", parseInt(value))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="3" />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h3 className="font-medium text-blue-900 mb-2">AI Participant Types</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span><strong>Confident Leader:</strong> Takes charge, makes decisive statements</span>
                </div>
                <div className="flex items-center">
                  <Bot className="w-4 h-4 mr-2" />
                  <span><strong>Emotional Speaker:</strong> Focuses on human impact and feelings</span>
                </div>
                <div className="flex items-center">
                  <CalendarDays className="w-4 h-4 mr-2" />
                  <span><strong>Data-Driven Analyst:</strong> Provides statistics and logical arguments</span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <CalendarDays className="w-4 h-4 mr-2" />
              {isLoading ? "Creating Session..." : "Create Session"}
            </Button>
          </form>

          {showSuccess && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center">
                <CheckCircle className="text-green-500 w-5 h-5 mr-3" />
                <div>
                  <h3 className="font-medium text-green-900">Session Created Successfully!</h3>
                  <p className="text-green-800 mt-1">Share this link with participants:</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <code className="bg-green-100 px-2 py-1 rounded text-sm font-mono flex-1">
                      {joinLink}
                    </code>
                    <Button variant="ghost" size="sm" onClick={copyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
