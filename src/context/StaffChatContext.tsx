"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface StaffMessage {
  id: string;
  sender: string;
  role: "doctor" | "nurse" | "compounder" | "system";
  text: string;
  time: string;
}

interface StaffChatContextType {
  messages: StaffMessage[];
  sendMessage: (text: string, roleOverride?: "doctor" | "nurse" | "compounder", senderNameOverride?: string) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  unreadCount: number;
  activeToast: StaffMessage | null;
  dismissToast: () => void;
  playNotificationSound: () => void;
  currentUserRole: "doctor" | "nurse";
  setCurrentUserRole: (role: "doctor" | "nurse") => void;
  currentUserName: string;
  setCurrentUserName: (name: string) => void;
}

const StaffChatContext = createContext<StaffChatContextType | undefined>(undefined);

// Web Audio API Hospital Notification Sound Synthesizer (Realistic Medical Chime)
function playHospitalChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Note 2: B5 (987.77 Hz) slightly delayed for a pleasant dual chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.22, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (e) {
    console.error("Audio chime error:", e);
  }
}

const INITIAL_MESSAGES: StaffMessage[] = [
  {
    id: "msg-1",
    sender: "Dr. Arvind Rao (Doctor)",
    role: "doctor",
    text: "Please prepare 500ml Normal Saline IV for incoming maternal hypertension patient.",
    time: "12:05 PM",
  },
  {
    id: "msg-2",
    sender: "Nurse Priya",
    role: "nurse",
    text: "Trauma Bed 1 is prepared with oxygen lines and monitor ready.",
    time: "12:08 PM",
  },
  {
    id: "msg-3",
    sender: "Dr. Arvind Rao (Doctor)",
    role: "doctor",
    text: "Blood glucose rapid test kit ready in Room 2.",
    time: "12:14 PM",
  },
];

export function StaffChatProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<StaffMessage[]>(INITIAL_MESSAGES);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeToast, setActiveToast] = useState<StaffMessage | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<"doctor" | "nurse">("doctor");
  const [currentUserName, setCurrentUserName] = useState<string>("Dr. Arvind Rao");

  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Initialize role and load messages from API & DB
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("userRole");
      if (savedRole === "nurse" || savedRole === "doctor") {
        setCurrentUserRole(savedRole);
      }
      const storedName = localStorage.getItem("userName");
      if (storedName && storedName.trim()) {
        if (savedRole === "doctor") {
          const formatted =
            storedName.toLowerCase().startsWith("dr.") || storedName.toLowerCase().startsWith("dr ")
              ? storedName
              : `Dr. ${storedName}`;
          setCurrentUserName(formatted);
        } else if (savedRole === "nurse") {
          const formatted =
            storedName.toLowerCase().startsWith("nurse") || storedName.toLowerCase().startsWith("duty nurse")
              ? storedName
              : `Nurse ${storedName}`;
          setCurrentUserName(formatted);
        } else {
          setCurrentUserName(storedName);
        }
      }
    } catch {}

    // Fetch persistent chat history from DB API
    const loadDbMessages = async () => {
      try {
        const res = await fetch("/api/staff-chat");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          setMessages(data.messages);
          try {
            localStorage.setItem("smart_triage_chat_messages", JSON.stringify(data.messages));
          } catch {}
        }
      } catch (e) {
        console.warn("Failed to load chat from API, using fallback:", e);
      }
    };
    loadDbMessages();

    // Setup Cross-Tab BroadcastChannel for instantaneous real-time sync
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel("smart_triage_realtime_chat");
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        if (event.data && event.data.type === "NEW_MESSAGE") {
          const incomingMsg: StaffMessage = event.data.message;

          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            const nextList = [...prev, incomingMsg];
            try {
              localStorage.setItem("smart_triage_chat_messages", JSON.stringify(nextList));
            } catch {}
            return nextList;
          });

          // Play chime and trigger notification on receiving client tab
          playHospitalChime();
          setActiveToast(incomingMsg);
          setUnreadCount((c) => c + 1);

          setTimeout(() => {
            setActiveToast((curr) => (curr?.id === incomingMsg.id ? null : curr));
          }, 6000);
        }
      };
    }

    // Multi-Device Cross-Network Sync: Polls database every 3.5 seconds
    const chatSyncInterval = setInterval(async () => {
      try {
        const res = await fetch("/api/staff-chat");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages((prev) => {
            if (data.messages.length > prev.length) {
              const latestIncoming = data.messages[data.messages.length - 1];
              // If new message from another staff member, notify & chime
              const currentUserId = typeof window !== "undefined" ? localStorage.getItem("userName") : "";
              if (latestIncoming && latestIncoming.sender !== currentUserId) {
                playHospitalChime();
                setActiveToast(latestIncoming);
                setUnreadCount((c) => c + 1);
              }
              try {
                localStorage.setItem("smart_triage_chat_messages", JSON.stringify(data.messages));
              } catch {}
              return data.messages;
            }
            return prev;
          });
        }
      } catch {}
    }, 3500);

    return () => {
      clearInterval(chatSyncInterval);
      if (channel) {
        channel.close();
      }
    };
  }, []);

  const triggerNotification = useCallback((msg: StaffMessage) => {
    setActiveToast(msg);
    playHospitalChime();

    setTimeout(() => {
      setActiveToast((curr) => (curr?.id === msg.id ? null : curr));
    }, 6000);
  }, []);

  const dismissToast = () => {
    setActiveToast(null);
  };

  const sendMessage = useCallback(
    async (text: string, roleOverride?: "doctor" | "nurse" | "compounder", senderNameOverride?: string) => {
      if (!text.trim()) return;

      const activeRole = (roleOverride || currentUserRole || "doctor") as "doctor" | "nurse" | "compounder";
      const isDoctorRole = activeRole === "doctor";

      let senderName = "";
      if (senderNameOverride && senderNameOverride.trim()) {
        senderName = senderNameOverride.trim();
      } else {
        if (isDoctorRole) {
          let docName = "";
          try {
            docName = localStorage.getItem("doctorName") || "";
          } catch {}
          if (!docName || docName.toLowerCase().includes("nurse") || docName.toLowerCase().includes("praharshitha") || docName.toLowerCase().includes("priya")) {
            try {
              const uName = localStorage.getItem("userName") || "";
              if (uName && !uName.toLowerCase().includes("nurse") && !uName.toLowerCase().includes("praharshitha") && !uName.toLowerCase().includes("priya")) {
                docName = uName.toLowerCase().startsWith("dr.") || uName.toLowerCase().startsWith("dr ") ? uName : `Dr. ${uName}`;
              }
            } catch {}
          }
          senderName = docName || "Dr. Amit Sharma";
        } else if (activeRole === "nurse") {
          let nName = "";
          try {
            nName = localStorage.getItem("nurseName") || "";
          } catch {}
          if (!nName || nName.toLowerCase().startsWith("dr.") || nName.toLowerCase().startsWith("dr ") || nName.toLowerCase().includes("amit")) {
            try {
              const uName = localStorage.getItem("userName") || "";
              if (uName && !uName.toLowerCase().startsWith("dr.") && !uName.toLowerCase().includes("amit")) {
                nName = uName.toLowerCase().startsWith("nurse") || uName.toLowerCase().startsWith("duty nurse") ? uName : `Nurse ${uName}`;
              }
            } catch {}
          }
          senderName = nName || "Nurse Praharshitha";
        } else {
          senderName = "Compounder Suresh";
        }
      }

      const nowStr = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const newMsg: StaffMessage = {
        id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        sender: senderName,
        role: activeRole,
        text: text.trim(),
        time: nowStr,
      };

      // 1. Update local state & localStorage
      setMessages((prev) => {
        const updated = [...prev, newMsg];
        try {
          localStorage.setItem("smart_triage_chat_messages", JSON.stringify(updated));
        } catch {}
        return updated;
      });

      // 2. Persist to real backend API database
      try {
        fetch("/api/staff-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: senderName,
            role: activeRole,
            text: text.trim(),
          }),
        }).catch((err) => console.warn("API staff-chat background save error:", err));
      } catch {}

      // 3. Play sound on sender & show toast if chat not open
      playHospitalChime();
      if (!isChatOpen) {
        triggerNotification(newMsg);
        setUnreadCount((c) => c + 1);
      }

      // 4. Broadcast to all open tabs/windows in real time
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({
          type: "NEW_MESSAGE",
          message: newMsg,
        });
      }
    },
    [currentUserRole, isChatOpen, triggerNotification]
  );

  const handleOpenChat = (open: boolean) => {
    setIsChatOpen(open);
    if (open) {
      setUnreadCount(0);
      setActiveToast(null);
    }
  };

  return (
    <StaffChatContext.Provider
      value={{
        messages,
        sendMessage,
        isChatOpen,
        setIsChatOpen: handleOpenChat,
        unreadCount,
        activeToast,
        dismissToast,
        playNotificationSound: playHospitalChime,
        currentUserRole,
        setCurrentUserRole,
        currentUserName,
        setCurrentUserName,
      }}
    >
      {children}
    </StaffChatContext.Provider>
  );
}

export function useStaffChat() {
  const context = useContext(StaffChatContext);
  if (!context) {
    throw new Error("useStaffChat must be used within a StaffChatProvider");
  }
  return context;
}
