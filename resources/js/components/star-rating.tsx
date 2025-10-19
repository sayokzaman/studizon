type StarRatingProps = {
    rating: number; // Current rating value (0 to 5, can be fractional)
    onRatingChange?: (newRating: number) => void; // Callback when rating changes
    readonly?: boolean; // If true, the rating is read-only
};

const StarRating = ({
    rating,
    onRatingChange,
    readonly = true,
}: StarRatingProps) => {
    const maxStars = 5;

    // Ensure rating is within valid range
    const normalizedRating = Math.min(Math.max(0, rating), maxStars);

    const handleStarClick = (starIndex: number) => {
        if (!readonly && onRatingChange) {
            onRatingChange(starIndex + 1);
        }
    };

    return (
        <div className="w-full">
            <div className="flex w-full items-center justify-between">
                {/* Stars Container */}
                <div className="flex flex-1 space-x-1">
                    {Array.from({ length: maxStars }, (_, index) => {
                        const starValue = index + 1;
                        let fillPercentage = 0;

                        if (normalizedRating >= starValue) {
                            // Star is fully filled
                            fillPercentage = 100;
                        } else if (normalizedRating > index) {
                            // Star is partially filled (calculate percentage)
                            fillPercentage = (normalizedRating - index) * 100;
                        }

                        return (
                            <button
                                key={index}
                                type="button"
                                className={`relative h-8 w-full focus:outline-none ${
                                    readonly
                                        ? 'cursor-default'
                                        : 'cursor-pointer transition-transform hover:scale-105'
                                }`}
                                onClick={() => handleStarClick(index)}
                                disabled={readonly}
                            >
                                {/* Empty Star Background */}
                                <div className="absolute inset-0 text-gray-300">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-full w-full"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                                        />
                                    </svg>
                                </div>

                                {/* Filled Star Foreground - using clip-path for precise partial filling */}
                                <div
                                    className="absolute inset-0 text-yellow-400"
                                    style={{
                                        clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                                    }}
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="h-full w-full"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                                        />
                                    </svg>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StarRating;
