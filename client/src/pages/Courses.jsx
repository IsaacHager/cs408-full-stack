import { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import CourseCard from '../components/CourseCard';
import AddCourseContextMenu from '../components/AddCourseContextMenu'

function Courses() {
  const { hasCanvasToken, loading: userLoading, user } = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0 });
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();

  const triggerRefresh = () => {
    setRefresh(prev => prev + 1);
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseIds((selected) =>
      selected.includes(courseId)
        ? selected.filter((id) => id !== courseId)
        : [...selected, courseId]
    );
  };

  const handleSelectAll = () => {
    const allIds = courses.map((course, index) => course.id ?? `course-${index}`);
    setSelectedCourseIds(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedCourseIds([]);
  };

  const handleCanvasLink = async () => {
    if (!selectedCourseIds || selectedCourseIds.length === 0) return;

    try {

      const response = await fetch(`/api/canvas/domain?userId=${user?.id}`);

      if (!response.ok) throw new Error("Failed to retrieve Canvas domain lookup.");

      const { canvasDomain } = await response.json();
      selectedCourseIds.forEach((courseId) => {
        const courseUrl = `${canvasDomain}/courses/${courseId}`;

        window.open(courseUrl, '_blank');
      });

    } catch (error) {
      console.error("Error launching Canvas course tabs:", error.message);
    }
  };

  const handleUnfavorite = async () => {
    const response = await fetch('/api/canvas/favorites', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, courseIds: selectedCourseIds })
    });
    handleDeselectAll();
    triggerRefresh();
  };

  const handleAddFavorite = (e) => {
    const button = e.currentTarget;
    const x = button.offsetLeft + button.offsetWidth;
    const y = button.offsetTop;

    setContextMenu({
      visible: true,
      x: x,
      y: y,
    });
  };

  const handleClose = () => {
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (!user?.id) return;
    if (!hasCanvasToken) return;

    fetch(`/api/canvas/favorites?userId=${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCourses(data || []);
      })
      .catch((err) => {
        console.error('Fetch courses error:', err);
      });
  }, [user?.id, refresh]);

  if (!hasCanvasToken) {
    return (
      <div>
        No Token Connected
      </div>
    );
  }

  return (
    <div className="text-3xl md:text-6xl grid grid-cols-4 gap-6 p-6 content-start h-full w-full">
      <div className="col-span-3 w-full">
        <div className="flex items-center gap-3">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-800">
            Tracked Courses
          </h1>
          <span className="px-2.5 py-1 text-sm font-semibold rounded-full bg-slate-800 text-slate-200 border border-slate-700">
            {courses.length}
          </span>
        </div>
        <p className="text-lg text-slate-600 mt-1">
          Synced from Canvas Favorited Courses (Some may not register here because Canvas API is arbitrarily selective)
        </p>
      </div>

      <div className="col-span-1 flex items-center justify-end gap-3">
        <button
          type="button"
          className="!w-10 !h-10 tactile-button"
          onClick={handleDeselectAll}
        >
          <img
            src="/circle-xmark-regular-full.svg"
            alt="Deselect All"
            className="p-1 w-full h-full object-contain filter invert transition-all"
          />
        </button>
        <button
          type="button"
          className="!w-10 !h-10 tactile-button"
          onClick={handleSelectAll}
        >
          <img
            src="/circle-check-regular-full.svg"
            alt="Select All"
            className="p-1 w-full h-full object-contain filter invert transition-all"
          />
        </button>
        <button
          type="button"
          className="tactile-button"
          onClick={() => navigate('/search', { state: { selectedCourseIds } })}
        >
          <img
            src="/magnifying-glass-arrow-right-solid-full.svg"
            alt="To Search"
            className="p-2 w-full h-full object-contain filter invert transition-all"
          />
        </button>
        <button
          type="button"
          className="tactile-button"
          onClick={handleCanvasLink}
        >
          <img
            src="/canvas-lms.svg"
            alt="Open in Canvas"
            className="p-2 w-full h-full object-contain filter transition-all"
          />
        </button>
        <button
          type="button"
          className="tactile-button"
          onClick={handleUnfavorite}
        >
          <img
            src="/trash-can-regular-full.svg"
            alt="Delete"
            className="p-2 w-full h-full object-contain filter invert transition-all"
          />
        </button>
      </div>

      <hr className="col-span-4 border-slate-800 border-t-2" />

      <div className="col-span-4 grid grid-cols-5 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id ?? `course-${index}`} course={course} isSelected={selectedCourseIds.includes(course.id)} onSelect={() => handleSelectCourse(course.id)} />
        ))}
        <div className="w-full h-full min-h-[220px] flex items-center justify-center">
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center border-2 border-slate-700 bg-transparent text-slate-700 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-all"
            aria-label="Add item"
            onClick={handleAddFavorite}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
      <AddCourseContextMenu
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        onClose={handleClose}
        callback={triggerRefresh}
      />
    </div>
  );
}

export default Courses;