function CourseCard({ course, isSelected, onSelect }) {
    return (
        <div
            onClick={onSelect}
            className={`border border-slate-500 rounded-2xl overflow-hidden shadow-lg
                ${isSelected
                    ? 'bg-slate-500 shadow-xl scale-[1.02]'
                    : 'bg-slate-800/80 hover:bg-slate-500'
                }`}>
            {isSelected && (
                <div className="absolute top-0 left-0 z-20 pointer-events-none">
                    <div className="w-0 h-0 border-t-[52px] border-t-slate-500 border-r-[52px] border-r-transparent drop-shadow-md" />

                    <svg
                        className="absolute top-2 left-2 w-4 h-4 text-white drop-shadow-sm"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3.5}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
            <img
                src={course.image_download_url || '/placeholder-course.png'}
                alt={course.name}
                className="w-full h-40 object-cover bg-slate-900"
            />
            <div className="p-4 space-y-2">
                <h2 className="text-lg font-bold text-white line-clamp-1">{course.name}</h2>

                {course.termName && (
                    <p className="text-xs text-slate-400">{course.termName}</p>
                )}
            </div>
        </div>
    );
}

export default CourseCard;
