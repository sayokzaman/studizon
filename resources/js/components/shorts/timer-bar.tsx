function TimerBar({ seconds, total }: { seconds: number; total: number }) {
    const pct = Math.max(0, Math.min(100, (seconds / total) * 100));

    return (
        <div className="absolute top-0 right-0 left-0 h-1 bg-white/20">
            <div
                className="h-1 transition-all duration-200 ease-in-out"
                style={{ width: `${pct}%`, background: 'white' }}
            />
        </div>
    );
}

export default TimerBar;
