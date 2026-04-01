// app/components/game/NotificationToast.tsx
// Auto-dismissing notification shown at the top-center of the screen.

"use client";

import { useEffect } from "react";

interface NotificationToastProps {
    message: string;
    onDismiss: () => void;
    duration?: number;
}

export default function NotificationToast({
                                              message,
                                              onDismiss,
                                              duration = 3000,
                                          }: NotificationToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, duration);
        return () => clearTimeout(timer);
    }, [onDismiss, duration]);

    return (
        <div className="notification-toast" onClick={onDismiss}>
            {message}
        </div>
    );
}