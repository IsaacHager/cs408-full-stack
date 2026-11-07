
import { Box, CircularProgress } from '@mui/material';

function LoadingSpinner() {
    return (
        <Box className="flex justify-center align-center h-[400px] ">
          <CircularProgress />
        </Box>
    );
}

export default LoadingSpinner;