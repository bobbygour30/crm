import ActivityTimeline from '../admin/ActivityTimeline';

function UserActivity({ activities, leads }) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight">
        Activity
      </h1>
      <ActivityTimeline activities={activities} leads={leads} />
    </div>
  );
}

export default UserActivity;