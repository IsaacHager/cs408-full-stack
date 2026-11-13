
import { Box, CircularProgress } from '@mui/material';

function LoadingSpinner() {
    return (
        <Box className="flex justify-center align-center">
          <CircularProgress />
        </Box>
    );
}

export default LoadingSpinner;