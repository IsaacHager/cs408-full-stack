import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip } from '@mui/material';
import { useUser } from '../context/UserContext';
import '../App.css';
import LoadingSpinner from '../components/LoadingSpinner';

function Search() {
  const { user } = useUser();

  const columns = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'course_name',
      headerName: 'Class',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => (
        <Chip label={params.value || `Course ${params.row.course_id}`} variant="outlined" size="small" />
      ),
    },
    {
      field: 'points_possible',
      headerName: 'Points',
      type: 'number',
      flex: 0.5,
      minWidth: 100,
      valueFormatter: (value) => (value !== null && value !== undefined ? `${value} pts` : '0 pts'),
    },
    {
      field: 'due_at',
      headerName: 'Due Date',
      flex: 1,
      minWidth: 180,
      sortComparator: (v1, v2, cellParams1, cellParams2) => {
        if (!v1 && !v2) return 0;

        const sortDirection = cellParams1.api.getSortModel()[0]?.sort;
        const multi = sortDirection === 'desc' ? 1 : -1;

        if (!v1) return -1 * multi;
        if (!v2) return 1 * multi;

        return new Date(v1).getTime() - new Date(v2).getTime();
      },
      valueFormatter: (value) => {
        if (!value) return 'No Due Date';

        return new Date(value).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
  ];
  {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchCanvasData = async () => {
        try {
          const response = await fetch(`/api/canvas/assignments?userId=${user?.id}`);

          const data = await response.json();
          setRows(data);
        } catch (error) {
          console.error('Error loading Canvas data:', error);
        } finally {
          setLoading?.(false);
        }
      };

      fetchCanvasData();
    }, []);

    if (loading) {
      return (
        <LoadingSpinner />
      );
    }

    return (
      <Box sx={{ p: 4, height: '90%', width: '100%' }}>
        {/* <Typography variant="h5" gutterBottom>
          Canvas LMS Assignments
        </Typography> */}

        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          disableRowSelectionOnClick
        />
      </Box>
    );
  };
}

export default Search;
