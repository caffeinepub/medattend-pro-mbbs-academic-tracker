// Timetable page with weekly grid

import { useState } from 'react';
import { useTimetable } from '../hooks/useLocalStore';
import TimetableGrid from '../components/timetable/TimetableGrid';
import TimetableEntryDialog from '../components/timetable/TimetableEntryDialog';
import type { TimetableEntry } from '../storage/models';
import { Plus } from 'lucide-react';

export default function TimetablePage() {
  const { entries, addEntry, updateEntry, deleteEntry } = useTimetable();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const handleAdd = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleSave = async (entry: TimetableEntry) => {
    if (editingEntry) {
      await updateEntry(entry);
    } else {
      await addEntry(entry);
    }
    setDialogOpen(false);
    setEditingEntry(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this timetable entry?')) {
      await deleteEntry(id);
    }
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Timetable</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </button>
      </div>

      <TimetableGrid entries={entries} onEdit={handleEdit} onDelete={handleDelete} />

      <TimetableEntryDialog
        open={dialogOpen}
        entry={editingEntry}
        onClose={() => {
          setDialogOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
