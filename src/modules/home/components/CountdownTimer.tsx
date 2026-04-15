import { useEffect, useState } from "react";

interface CountdownTimerProps {
    initialSeconds: number;
    onExpire?: () => void;
}

export const CountdownTimer = ({ initialSeconds, onExpire }: CountdownTimerProps) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (onExpire) onExpire();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onExpire]);

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0 ');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        return { hours, minutes, secs };
    };

    const { hours, minutes, secs } = formatTime(timeLeft);

    return (
        <div className="flex gap-1 text-white font-mono font-bold">
            <span className="bg-black px-1.5 py-0.5 rounded text-sm">{hours}</span>
            <span className="bg-black px-1.5 py-0.5 rounded text-sm">{minutes}</span>
            <span className="bg-black px-1.5 py-0.5 rounded text-sm">{secs}</span>
        </div>
    );
}
