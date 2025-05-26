"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import { io, type Socket } from "socket.io-client"
import { Send, ArrowLeft, ExternalLink, AlertCircle, Check, X, Clock, Package } from "lucide-react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

interface IMessage {
  id: number
  fromUserId: number
  toUserId: number
  content: string
  timestamp: string
  packageId?: number
}

interface IPackage {
  id: number
  advertisementId?: number
  packageName?: string
}

interface IUser {
  userFirstName: string
  userLastName: string
  userPhoto?: string
  userSubscription?: number // 👈 ajoute ceci
}

let socket: Socket

const getSubscriptionLabel = (code?: number) => {
  switch (code) {
    case 1:
      return "Starter"
    case 2:
      return "Premium"
    default:
      return "Gratuit"
  }
}

const getMaxRefundAmount = (subscriptionLevel?: number): number => {
  switch (subscriptionLevel) {
    case 1: // Starter
      return 115
    case 2: // Premium
      return 3000
    default: // Free
      return 0
  }
}



export default function ChatPage() {
  const { clientId } = useParams()
  const searchParams = useSearchParams()
  const packageIdFromQuery = searchParams.get("packageId")

  const [userId, setUserId] = useState<number | null>(null)
  const [messages, setMessages] = useState<IMessage[]>([])
  const [newMessage, setNewMessage] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [packageInfo, setPackageInfo] = useState<IPackage | null>(null)
  const [respondedMessageIds, setRespondedMessageIds] = useState<number[]>([])
  const [otherUser, setOtherUser] = useState<IUser | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState("")
  const [refundError, setRefundError] = useState<string | null>(null)


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Utilisateur non connecté.")
        return
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok && data.userId) {
          setUserId(data.userId)
        } else {
          throw new Error("Erreur d'authentification.")
        }
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.")
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    if (!userId || !clientId) return

    // Fetch other user info
    const fetchOtherUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${clientId}`)
        if (res.ok) {
          const userData = await res.json()
          setOtherUser(userData)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations de l'utilisateur", error)
      }
    }

    fetchOtherUser()

    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      transports: ["websocket"],
    })

    socket.on(`message-${userId}`, (newMsg: IMessage) => {
      if (
        (newMsg.fromUserId === Number(clientId) || newMsg.toUserId === Number(clientId)) &&
        (!packageIdFromQuery || String(newMsg.packageId) === packageIdFromQuery)
      ) {
        setMessages((prev) => [...prev, newMsg])
        scrollToBottom()
      }
    })

    socket.on(`typing-${userId}`, (typingUserId: number) => {
      if (typingUserId === Number(clientId)) {
        setIsTyping(true)
        setTimeout(() => setIsTyping(false), 3000)
      }
    })

    const fetchMessages = async () => {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/messages/conversation?from=${userId}&to=${clientId}${
          packageIdFromQuery ? `&packageId=${packageIdFromQuery}` : ""
        }`

        const res = await fetch(url)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || "Erreur de chargement.")
        setMessages(data)
        scrollToBottom()

        const lastPkgId =
          [...data].reverse().find((msg: IMessage) => msg.packageId)?.packageId ||
          (packageIdFromQuery ? Number.parseInt(packageIdFromQuery, 10) : null)

        if (lastPkgId) {
          const pkgRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/packages/${lastPkgId}`)
          const pkgData = await pkgRes.json()
          if (pkgRes.ok) setPackageInfo(pkgData)
        }
      } catch (err: any) {
        setError(err.message || "Erreur inattendue.")
      }
    }

    fetchMessages()

    return () => {
      socket.disconnect()
    }
  }, [userId, clientId, packageIdFromQuery])

  const handleSend = async () => {
    if (!newMessage.trim() || !userId || !clientId) return

    const msgToSend = {
      fromUserId: userId,
      toUserId: Number.parseInt(clientId as string),
      content: newMessage.trim(),
      packageId: packageInfo?.id || (packageIdFromQuery ? Number.parseInt(packageIdFromQuery, 10) : undefined),
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msgToSend),
      })

      const savedMessage = await res.json()
      if (!res.ok) throw new Error(savedMessage.message || "Erreur d'envoi.")

      socket.emit("sendMessage", savedMessage)
      setMessages((prev) => [...prev, savedMessage])
      setNewMessage("")
      scrollToBottom()
      inputRef.current?.focus()
    } catch (err: any) {
      setError(err.message || "Erreur inattendue.")
    }
  }


  const handleRefund = () => {
    setRefundAmount("")
    setRefundError(null)
    setShowRefundModal(true)
  }



  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }

    // Emit typing event
    if (userId && clientId) {
      socket.emit("typing", {
        fromUserId: userId,
        toUserId: Number.parseInt(clientId as string),
      })
    }
  }

  const confirmRefund = () => {
    const max = getMaxRefundAmount(otherUser?.userSubscription)
    const amountNum = Number(refundAmount)

    if (isNaN(amountNum) || amountNum <= 0) {
      setRefundError("Veuillez entrer un montant valide.")
      return
    }

    if (amountNum > max) {
      setRefundError(`Le montant dépasse le plafond autorisé (${max}€).`)
      return
    }

    alert(`✅ Remboursement validé de ${amountNum}€.`)
    setShowRefundModal(false)
  }


  const handleNegotiationResponse = async (accept: boolean, msg: IMessage, amount: number) => {
    if (!userId || !packageInfo?.advertisementId) return

    if (accept) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/advertisements/${packageInfo.advertisementId}/update-price`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPrice: amount }),
      })
    }

    const confirmation = {
      fromUserId: userId,
      toUserId: msg.fromUserId,
      content: accept ? `✅ Le client a accepté votre prix.` : `❌ Le client a refusé votre prix.`,
      packageId: msg.packageId,
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmation),
      })

      const confirmMsg = await res.json()
      socket.emit("sendMessage", confirmMsg)
      setMessages((prev) => [...prev, confirmMsg])
      setRespondedMessageIds((prev) => [...prev, msg.id]) // cache l'affichage des boutons
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réponse à la négociation.")
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  }

  // Group messages by date
  const groupedMessages: { [key: string]: IMessage[] } = {}
  messages.forEach((message) => {
    const date = new Date(message.timestamp).toLocaleDateString("fr-FR")
    if (!groupedMessages[date]) {
      groupedMessages[date] = []
    }
    groupedMessages[date].push(message)
  })

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-6rem)] flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-white">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/client/conversations" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>

          <div className="flex items-center">
            <div className="relative w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
              {otherUser?.userPhoto ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${otherUser.userPhoto}`}
                  alt={`${otherUser.userFirstName} ${otherUser.userLastName}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600">
                  {otherUser?.userFirstName?.[0] || "U"}
                </div>
              )}
            </div>

            <div>
              <h1 className="font-semibold text-gray-900">
                {otherUser ? `${otherUser.userFirstName} ${otherUser.userLastName}` : `Livreur #${clientId}`}
              </h1>
              {otherUser?.userSubscription !== undefined && (
                <p className="text-xs text-gray-500">
                  Abonnement :{" "}
                  <span className="font-medium text-green-600">
                    {getSubscriptionLabel(otherUser.userSubscription)}
                  </span>
                </p>
              )}
              {isTyping && <p className="text-xs text-green-600 animate-pulse">En train d'écrire...</p>}
            </div>
          </div>
        </div>

        {packageInfo?.advertisementId && (
          <Link
            href={`/annonces/${packageInfo.advertisementId}`}
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Voir l'annonce
          </Link>
          
        )}
      </div>

      {otherUser?.userSubscription !== undefined && getMaxRefundAmount(otherUser.userSubscription) > 0 && (
        <button
          onClick={() => handleRefund()}
          className="ml-3 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
        >
          Rembourser (max {getMaxRefundAmount(otherUser.userSubscription)}€)
        </button>
      )}


      {/* Package info if available */}
      {packageInfo && (
        <div className="px-4 py-2 bg-gray-50 border-b flex items-center">
          <Package className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">
            {packageInfo.packageName ? `Colis: ${packageInfo.packageName}` : `Colis #${packageInfo.id}`}
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {Object.keys(groupedMessages).map((date) => (
          <div key={date} className="mb-6">
            <div className="flex justify-center mb-4">
              <span className="text-xs bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
                {date === new Date().toLocaleDateString("fr-FR")
                  ? "Aujourd'hui"
                  : formatDate(groupedMessages[date][0].timestamp)}
              </span>
            </div>

            {showRefundModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-sm">
                  <h2 className="text-lg font-semibold mb-4">Remboursement</h2>

                  <p className="text-sm text-gray-600 mb-2">
                    Abonnement : <strong>{getSubscriptionLabel(otherUser?.userSubscription)}</strong>
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Montant maximum : <strong>{getMaxRefundAmount(otherUser?.userSubscription)} €</strong>
                  </p>

                  <input
                    type="number"
                    min="0"
                    max={getMaxRefundAmount(otherUser?.userSubscription)}
                    placeholder="Montant à rembourser (€)"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 mb-2 focus:ring focus:ring-blue-200"
                  />

                  {refundError && (
                    <p className="text-sm text-red-600 mb-2">{refundError}</p>
                  )}

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowRefundModal(false)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={confirmRefund}
                      className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
                    >
                      Valider
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {groupedMessages[date].map((msg) => {
                const isFromMe = msg.fromUserId === userId
                const isNegotiation = msg.content.includes("propose") && !isFromMe
                const alreadyResponded = respondedMessageIds.includes(msg.id)
                const amountMatch = msg.content.match(/(\d+)(?:\s?€)?/)
                const amount = amountMatch ? Number.parseInt(amountMatch[1], 10) : null

                return (
                  <div key={msg.id} className={`flex ${isFromMe ? "justify-end" : "justify-start"}`}>
                    <AnimatePresence>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={`max-w-[75%] rounded-lg p-3 ${
                          isFromMe
                            ? "bg-green-500 text-white rounded-tr-none"
                            : "bg-white border border-gray-200 rounded-tl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                        {isNegotiation && !alreadyResponded && amount !== null && (
                          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between gap-2">
                            <button
                              onClick={() => handleNegotiationResponse(false, msg, amount)}
                              className="flex items-center justify-center px-3 py-1 bg-white text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Refuser
                            </button>
                            <button
                              onClick={() => handleNegotiationResponse(true, msg, amount)}
                              className="flex items-center justify-center px-3 py-1 bg-white text-green-600 rounded text-sm font-medium hover:bg-green-50 transition-colors"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Accepter
                            </button>
                          </div>
                        )}

                        <div
                          className={`flex items-center mt-1 text-xs ${isFromMe ? "text-green-100" : "text-gray-400"}`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(msg.timestamp)}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t bg-white">
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start">
            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Votre message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
