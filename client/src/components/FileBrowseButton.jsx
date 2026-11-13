import { useRef } from 'react';

function FileBrowseButton({ onFileSelect, accept }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer tactile-button !w-[80px] float-right"
      >
        Browse
      </button>
    </div>
  );
}

export default FileBrowseButton;
