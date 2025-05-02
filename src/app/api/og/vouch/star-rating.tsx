export type StarRatingProps = {
  rating: number;
};

export const StarRating = ({ rating }: StarRatingProps) => {
  return (
    <div tw="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        let fill = "none";
        let stroke = "#999797";

        if (rating >= i + 1) {
          // full star
          fill = "#fcba03";
          stroke = "#fcba03";
        } else if (rating > i && rating < i + 1) {
          // half star
          fill = "url(#halfGradient)";
          stroke = "#fcba03";
        }

        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            width="68"
            height="68"
            viewBox="0 0 24 24"
            fill={fill}
            stroke={stroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {rating > i && rating < i + 1 && (
              <defs>
                <linearGradient id="halfGradient">
                  <stop offset="50%" stopColor="#fcba03" />
                  <stop offset="50%" stopColor="white" stopOpacity="0" />
                </linearGradient>
              </defs>
            )}
            <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
          </svg>
        );
      })}
    </div>
  );
};
