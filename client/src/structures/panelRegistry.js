import FilePreview from '../components/FilePreview';
import FileEditor from '../components/FileEditor';
import ToDoBar from '../components/ToDoBar';
import Calculator from '../components/Calculator';

export const PANEL_TYPES = {
    FILE: 'file',
    EDITOR: 'editor',
    TODO: 'todo',
    CALCULATOR: 'calculator',
};

export const PANEL_COMPONENTS = {
    [PANEL_TYPES.FILE]: FilePreview,
    [PANEL_TYPES.EDITOR]: FileEditor,
    [PANEL_TYPES.TODO]: ToDoBar,
    [PANEL_TYPES.CALCULATOR]: Calculator,
};