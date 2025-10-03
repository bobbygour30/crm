import ActivityTimeline from '../admin/ActivityTimeline';

function UserActivity({ activities, leads }) {
  return (
    <div className="space-y-6 mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 tracking-tight">
        Activity
      </h1>
      <ActivityTimeline activities={activities} leads={leads} />
    </div>
  );
}

export default UserActivity;