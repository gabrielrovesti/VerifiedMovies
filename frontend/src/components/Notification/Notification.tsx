import React from "react";
import "./Notification.css";

interface NotificationProps {
  message: string;
  onClose: () => void;
}

export default function Notification({ message, onClose }: NotificationProps) {
  return (
    <div className="notification-container">
      <div className="notification">
        <p>{message}</p>
        <button onClick={onClose}>Chiudi</button>
      </div>
    </div>
  );
}
