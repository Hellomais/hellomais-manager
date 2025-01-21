import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  Send,
  ArrowLeft,
  Pin,
  Trash2,
  MessageCircle as MessageCirclePinned,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChat } from "../../hooks/useChat";
import { useRoomUsers } from "../../hooks/useRoomUsers";

interface ModerationPageProps {
  roomId: number;
  onClose: () => void;
}

interface MessageUser {
  id: number;
  name: string;
  role: string;
  highlight: boolean;
  photo: string | null;
}

interface ChatMessage {
  id: number;
  content: string;
  roomId: number;
  userId: number;
  isPinned: boolean;
  pinnedById: number | null;
  metadata: any;
  createdAt: string;
  user: MessageUser;
}

function ModerationPage({ roomId, onClose }: ModerationPageProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const selectedEvent = JSON.parse(
    localStorage.getItem("selectedEvent") || "{}"
  );
  const eventId = selectedEvent?.id;

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, []);

  if (!roomId || !eventId) {
    return (
      <div className="fixed inset-0 bg-gray-100 z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Informações da sala não disponíveis</p>
          <button
            onClick={() => navigate("/rooms")}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Salas
          </button>
        </div>
      </div>
    );
  }

  const {
    messages,
    pinnedMessages,
    loading: messagesLoading,
    error: messagesError,
    sendMessage,
    pinMessage,
    unpinMessage,
    deleteMessage,
  } = useChat(roomId, token);

  const {
    users,
    onlineCount,
    totalUsers,
    totalPages,
    loading: usersLoading,
    error: usersError,
    refresh: refreshUsers,
    setPage,
    setSearchTerm: setUsersSearchTerm,
  } = useRoomUsers(roomId, token, eventId);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [pinnedMessages, scrollToBottom]);

  const handleSearch = () => {
    setUsersSearchTerm(searchTerm);
    setPage(1);
  };

  const handleExport = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(
        `https://api.hellomais.com.br/metrics/room/${roomId}/users/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Falha ao gerar relatório");
      }

      const downloadUrl = await response.text();

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `relatorio-sala-${roomId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar relatório:", error);
      alert("Erro ao gerar relatório. Por favor, tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;

    setIsSendingMessage(true);
    try {
      await sendMessage(newMessage);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Erro ao enviar mensagem. Por favor, tente novamente.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleBack = () => {
    navigate("/rooms");
    onClose();
  };

  const MessageComponent = ({
    message,
    isPinnedSection = false,
  }: {
    message: ChatMessage;
    isPinnedSection?: boolean;
  }) => {
    if (!message?.id || !message?.user) return null;

    return (
      <div
        className={`flex flex-col p-3 rounded-lg ${
          message.user.role === "manager"
            ? "bg-blue-50 border border-blue-100"
            : isPinnedSection
            ? "bg-yellow-50 border border-yellow-100"
            : "bg-gray-800"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span
              className={`text-sm ${
                message.user.role === "manager"
                  ? "text-blue-600 font-medium"
                  : isPinnedSection
                  ? "text-yellow-700"
                  : "text-gray-400"
              }`}
            >
              {message.user.name}
            </span>
            <span
              className={`text-xs ${
                isPinnedSection ? "text-yellow-600" : "text-gray-500"
              }`}
            >
              {message.createdAt}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() =>
                message.isPinned
                  ? unpinMessage(message.id)
                  : pinMessage(message.id)
              }
              className={`text-sm ${
                message.isPinned
                  ? "text-yellow-500 hover:text-yellow-600"
                  : message.user.role === "manager"
                  ? "text-blue-600 hover:text-blue-700"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              title={message.isPinned ? "Desafixar" : "Fixar"}
            >
              <Pin
                className={`h-4 w-4 ${message.isPinned ? "fill-current" : ""}`}
              />
            </button>
            <button
              onClick={() => deleteMessage(message.id)}
              className={`text-sm ${
                message.user.role === "manager"
                  ? "text-red-600 hover:text-red-700"
                  : "text-gray-400 hover:text-red-300"
              }`}
              title="Deletar"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p
          className={`mt-1 ${
            message.user.role === "manager"
              ? "text-gray-800"
              : isPinnedSection
              ? "text-yellow-900"
              : "text-gray-100"
          }`}
        >
          {message.content}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full p-6 overflow-hidden">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="inline-flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span>Voltar para Salas</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Relatório de Usuários na sala
              </h1>
            </div>
          </div>

          {/* Search and Actions */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar usuários"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-cyan-400 text-white rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Buscar
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                disabled={isDownloading}
                className="inline-flex items-center px-4 py-2 bg-cyan-400 text-white rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-4 w-4 mr-2" />
                {isDownloading ? "Baixando..." : "Baixar Excel"}
              </button>
              <button
                onClick={refreshUsers}
                className="px-4 py-2 bg-cyan-400 text-white rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tempo na sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ativo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usersLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Carregando...
                    </td>
                  </tr>
                ) : usersError ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-red-500"
                    >
                      {usersError}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.userName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.timeInRoom}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {user.isActive ? (
                          <span className="text-green-600">Ativo</span>
                        ) : (
                          <span className="text-gray-500">Inativo</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                disabled={currentPage === 1}
              >
                &lt;
              </button>
              <span className="px-4 py-1 border border-gray-300 rounded-md text-sm bg-blue-50">
                {currentPage}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
              <span className="text-sm text-gray-500 ml-4">
                Total: {totalUsers} usuários
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Sidebar */}
      <div className="w-96 bg-gray-900 text-white flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium">{onlineCount} online</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 pt-0"
          ref={messagesContainerRef}
        >
          {/* Pinned Messages Section */}
          {pinnedMessages && pinnedMessages.length > 0 && (
            <div className="sticky top-0 bg-gray-900 pt-2 pb-4 z-10">
              <div className="flex items-center space-x-2 mb-3">
                <MessageCirclePinned className="h-5 w-5 text-yellow-500" />
                <h3 className="text-sm font-medium text-yellow-500">
                  Mensagens Fixadas ({pinnedMessages.length})
                </h3>
              </div>
              <div className="space-y-3">
                {pinnedMessages.map((message) =>
                  message && message.id ? (
                    <MessageComponent
                      key={`pinned-${message.id}`}
                      message={message}
                      isPinnedSection={true}
                    />
                  ) : null
                )}
              </div>
              <div className="border-b border-gray-700 my-4" />
            </div>
          )}

          {/* Regular Messages */}
          {messagesLoading ? (
            <div className="text-center text-gray-500">
              Carregando mensagens...
            </div>
          ) : messagesError ? (
            <div className="text-center text-red-500">{messagesError}</div>
          ) : messages && messages.length > 0 ? (
            messages.map((message) =>
              message && message.id ? (
                <MessageComponent key={message.id} message={message} />
              ) : null
            )
          ) : (
            <div className="text-center text-gray-500">
              Nenhuma mensagem ainda
            </div>
          )}
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="p-4 border-t border-gray-800"
        >
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isSendingMessage}
            />
            <button
              type="submit"
              disabled={isSendingMessage}
              className={`p-2 ${
                isSendingMessage
                  ? "text-gray-500 cursor-not-allowed"
                  : "text-blue-400 hover:text-blue-300"
              }`}
            >
              <Send
                className={`h-5 w-5 ${isSendingMessage ? "animate-pulse" : ""}`}
              />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModerationPage;
