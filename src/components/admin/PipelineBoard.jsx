import { motion } from 'framer-motion';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLead({ lead, users }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignedUser = users.find((user) => user.id === lead.assignedTo);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-200 cursor-grab text-sm sm:text-base hover:shadow-md transition-shadow"
    >
      <p className="font-semibold text-gray-800">{lead.name}</p>
      <p className="text-sm text-gray-600">{lead.email}</p>
      <p className="text-xs text-gray-500">{lead.source}</p>
      {assignedUser && (
        <p className="text-xs text-indigo-600 mt-1">Assigned to: {assignedUser.name}</p>
      )}
    </motion.div>
  );
}

function PipelineBoard({ pipeline, users }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {Object.keys(pipeline).map((stage) => (
        <SortableContext
          key={stage}
          id={stage}
          items={pipeline[stage].map((lead) => lead.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="bg-gray-50 p-4 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">{stage}</h2>
            {pipeline[stage].map((lead) => (
              <SortableLead key={lead.id} lead={lead} users={users} />
            ))}
          </div>
        </SortableContext>
      ))}
    </motion.div>
  );
}

export default PipelineBoard;