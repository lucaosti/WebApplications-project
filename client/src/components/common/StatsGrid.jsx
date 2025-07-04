/**
 * Reusable statistics grid component.
 * Displays a grid of statistical values with labels in a responsive layout.
 * Commonly used in dashboards to show summary information.
 * 
 * @param {Array} stats - Array of stat objects with 'value' and 'label' properties
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
