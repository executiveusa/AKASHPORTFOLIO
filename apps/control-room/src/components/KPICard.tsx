interface KPICardProps {
  label: string;
  value: number | string;
  color: string;
}

export default function KPICard({ label, value, color }: KPICardProps) {
  return (
    <div className="panel" style={{ padding: '12px 20px', flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 11, color: 'var(--color-cream-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>
        {value}
      </div>
    </div>
  );
}
