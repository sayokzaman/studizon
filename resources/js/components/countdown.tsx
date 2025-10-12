import React, { useCallback, useEffect, useState } from 'react';

interface CountdownProps {
    startTime: string; // format "HH:mm:ss"
    className?: string;
}

const Countdown: React.FC<CountdownProps> = ({ startTime, className }) => {
    // Convert "HH:mm:ss" to a Date object today
    const calculateTimeLeft = useCallback(() => {
        const getTargetDate = () => {
            const [hours, minutes, seconds] = startTime.split(':').map(Number);
            const now = new Date();
            const target = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                hours,
                minutes,
                seconds,
            );

            // If target time already passed today, assume it's tomorrow
            if (target.getTime() < now.getTime()) {
                target.setDate(target.getDate() + 1);
            }

            return target;
        };

        const difference = getTargetDate().getTime() - new Date().getTime();
        if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return {
            hours: Math.floor(difference / (1000 * 60 * 60)),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }, [startTime]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [calculateTimeLeft]);

    const formatNumber = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className={className}>
            {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:
            {formatNumber(timeLeft.seconds)}
        </div>
    );
};

export default Countdown;
