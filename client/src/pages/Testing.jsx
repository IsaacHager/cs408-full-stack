import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import '../App.css';
import EditTaskModal from '../components/EditTaskModal';

function Testing() {
  const [assignments, setAssignments] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [refreshDrafts, setRefreshDrafts] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [currentDraft, setCurrentDraft] = useState(null);
  const [refreshCurrentDraft, setRefreshCurrentDraft] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  async function createDraft(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title');
    const assignmentId = formData.get('assignment');
    const userId = user?.id;

    const assignment = assignments.find(a => String(a.id) === String(assignmentId));
    const courseId = assignment.course_id;

    console.log(assignment);

    try {
      const response = await fetch(`/api/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canvasAssignmentId: assignmentId, canvasCourseId: courseId, title, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRefreshDrafts(prev => prev + 1);

    } catch (error) {
      console.error('Error creating draft:', error);
    }
  }

  async function deleteDraft(draftId) {
    try {
      const response = await fetch(`/api/draft/${draftId}?userId=${user?.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setCurrentDraft(null);
      setRefreshCurrentDraft(prev => prev + 1);
      setRefreshDrafts(prev => prev + 1);

    } catch (error) {
      console.error('Error creating draft:', error);
    }
  }

  async function showDraft(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const draft = formData.get('draft');

    setCurrentDraft({ _id: draft });
    setRefreshCurrentDraft(prev => prev + 1);

  }

  async function editDraft(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const title = formData.get('title');
    const assignment = formData.get('assignment');
    const userId = user?.id;

    try {
      const response = await fetch(`/api/draft/${currentDraft._id}?userId=${userId}`, {
        method: 'PUT', headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, assignment }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRefreshDrafts(prev => prev + 1);
      setRefreshCurrentDraft(prev => prev + 1);

    } catch (error) {
      console.error('Error updating draft:', error);
    }
  }

  async function uploadFile(e) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const userId = user?.id;

    try {
      const response = await fetch(`/api/draft/${currentDraft._id}/files?userId=${userId}`, {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setRefreshCurrentDraft(prev => prev + 1);

    } catch (error) {
      console.error('Error updating draft:', error);
    }
  }

  async function handleDeleteFile(fileId) {
    if (!currentDraft?._id || !user?.id) return;

    try {
      const response = await fetch(
        `/api/draft/${currentDraft._id}/files/${fileId}?userId=${user.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete file');
      }

      setRefreshCurrentDraft(prev => prev + 1);

    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async function handleCloseModal() {
    setIsModalOpen(false);
    setRefreshCurrentDraft(prev => prev + 1);
    setEditTask(null);
  }

  async function handleToggleTask(taskId, isCompleted) {
    if (!currentDraft?._id || !user?.id) return;

    try {
      const response = await fetch(
        `/api/draft/${currentDraft._id}/todos/${taskId}?userId=${user.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isCompleted }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update task status');
      }

      setRefreshCurrentDraft((prev) => prev + 1);

    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }

  async function handleDeleteTask(taskId) {
    if (!currentDraft?._id || !user?.id) return;

    try {
      const response = await fetch(
        `/api/draft/${currentDraft._id}/todos/${taskId}?userId=${user.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete task');
      }

      setRefreshCurrentDraft(prev => prev + 1);

    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  function formatBytes(bytes, locale = 'en-US') {
    if (bytes === 0) return '0 B';

    const units = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);

    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: units[i],
      unitDisplay: 'narrow',
      maximumFractionDigits: 2
    }).format(value);
  }

  useEffect(() => {
    const fetchCanvasData = async () => {
      try {
        const response = await fetch(`/api/canvas/assignments?userId=${user?.id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch assignments');
        }

        setAssignments(data);
      } catch (error) {
        console.error('Error loading Canvas data:', error);
      } finally {
        setLoading?.(false);
      }
    };

    fetchCanvasData();
  }, []);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const response = await fetch(`/api/draft?userId=${user?.id}`);

        const data = await response.json();
        setDrafts(data.data);
      } catch (error) {
        console.error('Error loading drafts:', error);
      } finally {
        setLoading?.(false);
      }
    };

    fetchDrafts();
  }, [refreshDrafts]);

  useEffect(() => {
    const fetchCurrentDraft = async () => {
      if (!currentDraft || !user?.id) return;
      try {
        const response = await fetch(`/api/draft/${currentDraft._id}?userId=${user.id}`);

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error);
        }

        setCurrentDraft(data);

      } catch (error) {
        console.error('Error retrieving draft:', error);
      }
    }

    fetchCurrentDraft();
  }, [refreshCurrentDraft]);

  return (
    <>
      <div className="w-[800px] items-center justify-items-center bg-slate-600 p-4 m-8">
        <div className="w-full flex flex-col gap-y-4">
          <form className="bg-slate-500 p-2 border-slate-900 border flex flex-col gap-y-4" onSubmit={createDraft}>
            <div>
              <label className="mr-4">Draft Title</label>
              <input
                name="title"
                type="text"
                placeholder="Enter draft title..."
                className="bg-slate-600"
                required
              />
            </div>

            <div>
              <label className="mr-4">Canvas Assignment</label>
              <select className="bg-slate-600" name="assignment" required>
                <option value="">-- Select an Assignment --</option>
                {assignments.map(assignment => (
                  <option key={assignment.id} value={assignment.id} className="p-4 border shadow-sm bg-white text-xs">
                    {assignment.name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="tactile-button !w-[200px] !h-10">Create Draft</button>
          </form>
          <form className="bg-slate-500 p-2 border-slate-900 border flex items-center justify-between" onSubmit={showDraft}>
            <div>
              <label className="mr-4">Show Draft</label>
              <select className="bg-slate-600" name="draft" required>
                <option value="">-- Select a Draft --</option>
                {drafts.map(draft => (
                  <option key={draft._id} value={draft._id} className="p-4 border shadow-sm bg-white text-xs">
                    {draft.title}
                  </option>
                ))}
              </select>

            </div>

            <button type="submit" className="tactile-button !w-[150px] !h-10">Find</button>
          </form>
          {currentDraft &&
            <div className="bg-slate-500 p-2 border-slate-900 border flex flex-col gap-y-4">
              <div className="flex justify-between">
                <h1 className="font-semibold mb-2">Edit Draft</h1>
                <button className="tactile-button !w-16 !h-10 !bg-rose-700" onClick={() => deleteDraft(currentDraft._id)}>Delete</button>
              </div>

              <form onSubmit={editDraft}>
                <label className="mr-4">Title</label>
                <input
                  name="title"
                  type="text"
                  placeholder={currentDraft?.title}
                  className="bg-slate-600"
                />
              </form>

              <form onSubmit={editDraft} className="flex items-center gap-x-2">
                <label className="mr-4">Canvas Assignment</label>
                <select className="bg-slate-600" name="assignment" key={`${currentDraft.canvasAssignmentId}`} defaultValue={currentDraft.canvasAssignmentId} required>
                  <option value="">-- Select an Assignment --</option>
                  {assignments.map(assignment => (
                    <option key={assignment.id} value={assignment.id} className="p-4 border shadow-sm bg-white text-xs">
                      {assignment.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="tactile-button !w-[150px] !h-10">Submit</button>
              </form>

              {currentDraft.files?.length || 0} Attached File{currentDraft.files?.length === 1 ? '' : 's'}
              <ul className="divide-y divide-slate-700 border border-slate-700 bg-slate-800">
                {currentDraft?.files?.map((file, index) => (
                  <li
                    key={file._id || index}
                    className="flex items-center justify-between p-3 text-sm text-slate-200 hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <p className="font-medium text-slate-100 truncate">
                        {file.fileName || 'Untitled File'}
                      </p>
                      {file.fileSize &&
                        <p className="text-xs text-slate-400">
                          {formatBytes(file.fileSize)} 
                        </p>
                      }
                    </div>

                    <div className="items-center">
                      <a
                        href={`/api/draft/${currentDraft._id}/files/${file.fileId}`}
                        download={file.fileName || true}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-1 text-xs font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-600 transition-colors"
                      >
                        Download
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.fileId)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <form className="mt-6 flex items-center justify-between" onSubmit={uploadFile}>
                <label className="mr-4">
                  Add File:
                </label>
                <input
                  name="file"
                  type="file"
                  className="bg-slate-600"
                />
                <button type="submit" className="tactile-button !w-[150px] !h-10">Submit</button>
              </form>

              {currentDraft?.todos?.length || 0} Task{currentDraft?.todos?.length === 1 ? '' : 's' || 's'}
              <ul className="divide-y divide-slate-300 border border-slate-400 bg-slate-200">
                {currentDraft?.todos?.map((task, index) => (
                  <li
                    key={task._id || index}
                    className="flex items-center justify-between p-3 text-sm text-slate-800 hover:bg-slate-200/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <input
                        type="checkbox"
                        checked={task.isCompleted || false}
                        onChange={(e) => handleToggleTask(task._id, e.target.checked)}
                        className="h-4 w-4 rounded border-slate-400 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <p className="font-medium text-slate-800 truncate">
                        {task.task || 'Untitled File'}
                      </p>
                      {task?.timeMinutes > 0 &&
                        <p className="text-xs text-slate-600">
                          {String(task.timeMinutes)} mins
                        </p>
                      }
                    </div>
                    <div className="items-center flex gap-x-2">
                      <button className="tactile-button float-right" onClick={() => {
                        setEditTask(task);
                        setIsModalOpen(true);
                      }}>
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
                        title="Remove file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div>
                <button className="tactile-button !w-[150px] !h-10 float-right" onClick={() => setIsModalOpen(true)}>Add Task</button>
              </div>
            </div>
          }
        </div>
      </div>
      <EditTaskModal
        task={editTask}
        draftId={currentDraft?._id}
        parentId={null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}

export default Testing;