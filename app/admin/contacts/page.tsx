"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  RefreshCw,
  MessageSquare,
  ChevronDown,
  X,
  Clock,
} from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ip_address: string | null;
  user_agent: string | null;
  status: string;
  created_at: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  new: { label: "New", color: "text-blue-700", bg: "bg-blue-100" },
  read: { label: "Read", color: "text-gray-700", bg: "bg-gray-100" },
  archived: {
    label: "Archived",
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
};

const STATUSES = ["new", "read", "archived"];

export default function ContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [newCount, setNewCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/admin/contact-messages?${params}`);
      if (res.ok) {
        const data = await res.json();
        const msgs: ContactMessage[] = data.messages || [];
        setMessages(msgs);
        setPagination(data.pagination);
        setNewCount(data.newCount ?? 0);
        setStatusCounts(data.statusCounts ?? {});
        // Keep selected in sync with latest server data
        setSelected((prev) =>
          prev ? (msgs.find((m) => m.id === prev.id) ?? prev) : null,
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleStatusChange = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Use functional update to avoid stale closure
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m)),
        );
        setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
        await fetchMessages();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update status");
      }
    } catch (err) {
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/contact-messages/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
        if (selected?.id === id) setSelected(null);
        await fetchMessages();
      } else {
        alert("Failed to delete");
      }
    } catch {
      alert("An error occurred");
    } finally {
      setDeletingId(null);
    }
  };

  const openDetail = async (msg: ContactMessage) => {
    setSelected(msg);
    if (msg.status === "new") {
      await handleStatusChange(msg.id, "read");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const tabs = [
    { value: "", label: "All", count: pagination?.total },
    { value: "new", label: "New", count: statusCounts.new ?? 0 },
    { value: "read", label: "Read", count: statusCounts.read ?? 0 },
    { value: "archived", label: "Archived", count: statusCounts.archived ?? 0 },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Contact Messages
            {newCount > 0 && (
              <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                {newCount} new
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage incoming contact form submissions
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="inline-flex items-center px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === tab.value
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <MessageSquare className="h-12 w-12 mb-3" />
            <p className="text-lg">No messages</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {messages.map((msg) => {
                  const cfg =
                    STATUS_CONFIG[msg.status] || STATUS_CONFIG["read"];
                  const isNew = msg.status === "new";
                  return (
                    <tr
                      key={msg.id}
                      onClick={() => openDetail(msg)}
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${isNew ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`text-sm font-medium ${isNew ? "text-gray-900 font-semibold" : "text-gray-900"}`}
                        >
                          {msg.name}
                        </div>
                        <div className="text-sm text-gray-500">{msg.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p
                          className={`text-sm truncate max-w-xs ${isNew ? "font-semibold text-gray-900" : "text-gray-700"}`}
                        >
                          {msg.subject || "(no subject)"}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-xs mt-0.5">
                          {msg.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}
                        >
                          {isNew && (
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5" />
                          )}
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                          {formatDate(msg.created_at)}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {/* Status selector */}
                          <div className="relative">
                            <select
                              value={msg.status}
                              disabled={updatingId === msg.id}
                              onChange={(e) =>
                                handleStatusChange(msg.id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded-lg pl-2 pr-6 py-1.5 appearance-none bg-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50 cursor-pointer"
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {STATUS_CONFIG[s].label}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
                          </div>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            disabled={deletingId === msg.id}
                            className="text-red-500 hover:text-red-700 disabled:opacity-50 p-1 rounded"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selected.subject || "(no subject)"}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(selected.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600 ml-4"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Sender Info */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-500">From</span>
                  <p className="text-gray-900 mt-0.5 font-semibold">
                    {selected.name}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Email</span>
                  <a
                    href={`mailto:${selected.email}`}
                    className="block text-purple-600 hover:underline mt-0.5"
                  >
                    {selected.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Message</p>
              <div className="bg-gray-50 rounded-lg p-4 text-gray-800 whitespace-pre-wrap text-sm leading-relaxed">
                {selected.message}
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-between px-6 py-4 border-t bg-gray-50 rounded-b-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">
                  Status:
                </span>
                <select
                  value={selected.status}
                  disabled={updatingId === selected.id}
                  onChange={(e) =>
                    handleStatusChange(selected.id, e.target.value)
                  }
                  className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <a
                  href={`mailto:${selected.email}?subject=Re: ${selected.subject || ""}`}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <MailOpen className="h-4 w-4 mr-2" />
                  Reply via Email
                </a>
                <button
                  onClick={() => handleDelete(selected.id)}
                  disabled={deletingId === selected.id}
                  className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
