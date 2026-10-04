
interface SummaryCardProps {
  title: string;
  value: number;
}

function SummaryCard({ title, value }: SummaryCardProps) {
  return (
    <article className="summary-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

export default SummaryCard;