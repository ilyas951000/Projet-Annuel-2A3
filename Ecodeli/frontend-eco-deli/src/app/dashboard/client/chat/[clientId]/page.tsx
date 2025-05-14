"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

interface IMessage {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  timestamp: string;
  packageId?: number;
}

interface IPackage {
  id: number;
  advertisementId?: number;
}

let socket: Socket;

export default function ChatPage() {
  const { clientId } = useParams();
  const searchParams = useSearchParams();
  const packageIdFromQuery = searchParams.get("packageId");

  const [userId, setUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [packageInfo, setPackageInfo] = useState<IPackage | null>(null);
  const [respondedMessageIds, setRespondedMessageIds] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Utilisateur non connecté.");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.userId) {
          setUserId(data.userId);
        } else {
          throw new Error("Erreur d'authentification.");
        }
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!userId || !clientId) return;

    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
    });

    socket.on(`message-${userId}`, (newMsg: IMessage) => {
      if (
        (newMsg.fromUserId === Number(clientId) || newMsg.toUserId === Number(clientId)) &&
        (!packageIdFromQuery || String(newMsg.packageId) === packageIdFromQuery)
      ) {
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    });

    const fetchMessages = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/messages/conversation?from=${userId}&to=${clientId}${packageIdFromQuery ? `&packageId=${packageIdFromQuery}` : ""}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur de chargement.");
        setMessages(data);
        scrollToBottom();

        const lastPkgId =
          [...data].reverse().find((msg: IMessage) => msg.packageId)?.packageId ||
          (packageIdFromQuery ? parseInt(packageIdFromQuery) : null);

        if (lastPkgId) {
          const pkgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${lastPkgId}`);
          const pkgData = await pkgRes.json();
          if (pkgRes.ok) setPackageInfo(pkgData);
        }
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.");
      }
    };

    fetchMessages();

    return () => {
      socket.disconnect();
    };
  }, [userId, clientId, packageIdFromQuery]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !clientId) return;

    const msgToSend = {
      fromUserId: userId,
      toUserId: parseInt(clientId as string),
      content: newMessage.trim(),
      packageId: packageInfo?.id || (packageIdFromQuery ? parseInt(packageIdFromQuery) : undefined),
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgToSend),
      });

      const savedMessage = await res.json();
      if (!res.ok) throw new Error(savedMessage.message || "Erreur d'envoi.");

      socket.emit("sendMessage", savedMessage);
      setMessages((prev) => [...prev, savedMessage]);
      setNewMessage("");
      scrollToBottom();
    } catch (err: any) {
      setError(err.message || "Erreur inattendue.");
    }
  };

  const handleNegotiationResponse = async (accept: boolean, msg: IMessage, amount: number) => {
    if (!userId || !packageInfo?.advertisementId) return;

    if (accept) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${packageInfo.advertisementId}/update-price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPrice: amount }),
      });
    }

    const confirmation = {
      fromUserId: userId,
      toUserId: msg.fromUserId,
      content: accept
        ? `✅ Le client a accepté votre prix.`
        : `❌ Le client a refusé votre prix.`,
      packageId: msg.packageId,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(confirmation),
    });

    const confirmMsg = await res.json();
    socket.emit("sendMessage", confirmMsg);
    setMessages((prev) => [...prev, confirmMsg]);
    setRespondedMessageIds((prev) => [...prev, msg.id]); // cache l'affichage des boutons
  };

  return (
    <div className="max-w-2xl mx-auto p-4 h-[80vh] flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Chat avec le livreur #{clientId}</h1>

      {packageInfo?.advertisementId && (
        <div className="mb-4 text-right">
          <Link
            href={`/annonces/${packageInfo.advertisementId}`}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Voir l'annonce liée
          </Link>
        </div>
      )}

      <div className="flex-1 overflow-y-auto border p-4 rounded bg-gray-100 space-y-2">
        {messages.map((msg) => {
          const isNegotiation = msg.content.includes("propose") && msg.fromUserId !== userId;
          const alreadyResponded = respondedMessageIds.includes(msg.id);

          const amountMatch = msg.content.match(/(\d+)(?:\s?€)?/);
          const amount = amountMatch ? parseInt(amountMatch[1]) : null;

          return (
            <div
              key={msg.id}
              className={`p-2 rounded max-w-[70%] ${
                msg.fromUserId === userId
                  ? "bg-blue-500 text-white self-end ml-auto"
                  : "bg-white text-black self-start"
              }`}
            >
              <p>{msg.content}</p>
              <p className="text-xs text-gray-400 mt-1 text-right">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>

              {isNegotiation && !alreadyResponded && amount !== null && (
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => handleNegotiationResponse(true, msg, amount)}
                    className="text-green-600 hover:underline"
                  >
                    Accepter
                  </button>
                  <button
                    onClick={() => handleNegotiationResponse(false, msg, amount)}
                    className="text-red-600 hover:underline"
                  >
                    Refuser
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef}></div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Votre message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          onClick={handleSend}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Envoyer
        </button>
      </div>

      {error && <p className="mt-2 text-red-600 text-center">{error}</p>}
    </div>
  );
}
