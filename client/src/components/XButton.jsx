function XButton({ onClick }) {

    return (

        <button
            type="button"
            onClick={onClick}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700 transition-colors"
            title="Remove file"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    )
}

export default XButton;