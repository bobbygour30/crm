import { motion } from 'framer-motion';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLead({ lead }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      className="bg-white p-4 mb-2 rounded-lg shadow-sm border border-gray-200 cursor-grab text-sm sm:text-base"
    >
      <p className="font-semibold text-gray-800">{lead.name}</p>
      <p className="text-sm text-gray-600">{lead.email}</p>
      <p className="text-xs text-gray-500">{lead.source}</p>
    </motion.div>
  );
}

function PipelineBoard({ pipeline }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
    >
      {Object.keys(pipeline).map((stage) => (
        <SortableContext key={stage} id={stage} items={pipeline[stage].map((lead) => lead.id)} strategy={verticalListSortingStrategy}>
          <div className="bg-gray-50 p-4 rounded-xl shadow-md">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">{stage}</h2>
            {pipeline[stage].map((lead) => (
              <SortableLead key={lead.id} lead={lead} />
            ))}
          </div>
        </SortableContext>
      ))}
    </motion.div>
  );
}

export default PipelineBoard;