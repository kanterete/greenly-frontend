import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { api } from "../api/client";

function formatRelativeTime(isoDate) {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "";
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "Przed chwilą";
  if (diffMin < 60) return `${diffMin} min temu`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} godz. temu`;
  return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" });
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotifications(30);
      setNotifications(Array.isArray(data?.notifications) ? data.notifications : []);
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch {
      // Ignoruj błędy w tle, żeby dzwonek nie przerywał pracy aplikacji
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 60000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications();

    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, loadNotifications]);

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      api.markNotificationRead(item.id).catch(() => {});
    }
    setIsOpen(false);
    if (item.url) {
      navigate(item.url);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api.markAllNotificationsRead();
    } catch {
      loadNotifications();
    }
  };

  return (
    <div className="notification-bell-wrapper" ref={containerRef}>
      <button
        type="button"
        className="notification-bell-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Powiadomienia${unreadCount > 0 ? ` (${unreadCount} nieprzeczytanych)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell size={18} strokeWidth={1.9} />
        {unreadCount > 0 && (
          <span className="notification-bell-badge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown" role="dialog" aria-label="Lista powiadomień">
          <div className="notification-dropdown-header">
            <strong>Powiadomienia</strong>
            {unreadCount > 0 && (
              <button
                type="button"
                className="notification-read-all-btn"
                onClick={handleMarkAllRead}
              >
                <CheckCheck size={14} /> Oznacz przeczytane
              </button>
            )}
          </div>

          <div className="notification-dropdown-list">
            {isLoading && notifications.length === 0 ? (
              <p className="notification-empty">Ładowanie powiadomień…</p>
            ) : notifications.length === 0 ? (
              <p className="notification-empty">Brak powiadomień.</p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`notification-item ${item.isRead ? "read" : "unread"}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="notification-item-top">
                    <span className="notification-item-title">{item.title}</span>
                    {!item.isRead && <span className="notification-unread-dot" aria-hidden="true" />}
                  </div>
                  <p className="notification-item-body">{item.body}</p>
                  <span className="notification-item-time">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
