export default function ProgressRing({ percent, size = 64, stroke = 5 }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, Math.max(0, percent)) / 100) * circ;
  const color =
    percent >= 80 ? "#16A34A" : percent >= 50 ? "#F59E0B" : "#DC2626";
  return (
    <svg
      width={size}
      height={size}
      className="progress-ring"
      style={{ display: "block" }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={"rotate(-90 " + size / 2 + " " + size / 2 + ")"}
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
    </svg>
  );
}
