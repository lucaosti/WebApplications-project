import { useAuth } from '../auth/AuthContext.jsx';
import { useDashboardData } from '../hooks/useDashboardData.js';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import StatsGrid from '../components/common/StatsGrid.jsx';
import AssignmentList from '../components/assignments/AssignmentList.jsx';

/**
 * StudentDashboard displays the assignments assigned to the logged-in student,
 * along with their weighted average score.
 */
export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useDashboardData({
    assignments: '/api/assignments',
    average: '/api/student/average'
  });

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  // Handle data extraction with safe defaults
  const assignments = Array.isArray(data.assignments) ? data.assignments : [];
  const average = data.average?.average || null;

  // Separate assignments by status
  const openAssignments = assignments.filter(a => a.status === 'open');
  const closedAssignments = assignments.filter(a => a.status === 'closed');

  // Calculate summary statistics
  const stats = [
    { value: assignments.length, label: 'Total Assignments' },
    { value: openAssignments.length, label: 'Open' },
    { value: closedAssignments.length, label: 'Closed' },
    { value: average !== null ? average.toFixed(2) : 'N/A', label: 'Average Score' }
  ];

  return (
    <div className="dashboard">
      <h2>Student Dashboard</h2>

      <ErrorMessage error={error} onRetry={refetch} />

      <AssignmentList 
        assignments={openAssignments}
        title="Open Assignments"
        emptyMessage="No open assignments."
        showScore={false}
      />

      <StatsGrid stats={stats} />

      <AssignmentList 
        assignments={closedAssignments}
        title="Completed Assignments"
        emptyMessage="No completed assignments yet."
        showScore={true}
      />
    </div>
  );
}
