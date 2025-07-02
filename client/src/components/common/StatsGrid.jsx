/**
 * Reusable statistics grid component
 */
export default function StatsGrid({ stats }) {
  return (
    <div className="form-container mb-lg">
      <h3>Statistics</h3>
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stats-item">
            <h4>{stat.value}</h4>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
