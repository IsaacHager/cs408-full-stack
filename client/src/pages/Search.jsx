import React, { useState, useEffect, useRef } from 'react';
import '../App.css';

function Search() {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);

  return (
    <div className="w-3/4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => {}}
        className="p-1 mb-2 w-full text-lg border border-gray-300 rounded outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
      />
      <div className="w-full">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th
                onClick={() => {}}
                className="cursor-pointer border p-2 text-left"
              >
                Table
              </th>
            </tr>
          </thead>
          <tbody>
              <tr className="border">
                <td className="border p-2">Item</td>
              </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Search;