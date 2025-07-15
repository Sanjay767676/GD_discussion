import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import SessionForm from "@/components/session-form";
import { apiRequest } from "@/lib/queryClient";

export default function SchedulePage() {
  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/sessions", data);
      return response.json();
    },
  });

  const handleCreateSession = async (data: any) => {
    // Transform form data to match backend schema
    const sessionData = {
      topic: data.topic,
      scheduledAt: new Date(`${data.date}T${data.time}`).toISOString(),
      aiCount: data.aiCount,
      realCount: data.realCount,
      createdBy: data.name,
    };
    await createSessionMutation.mutateAsync(sessionData);
  };

  return (
    <div>
      <SessionForm 
        onSubmit={handleCreateSession} 
        isLoading={createSessionMutation.isPending}
      />
    </div>
  );
}
