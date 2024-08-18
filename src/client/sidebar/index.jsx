import { createRoot } from 'react-dom/client';
import Sidebar from './components/Sidebar';
import './styles.css';

const container = document.getElementById('index');
const root = createRoot(container);
root.render(<Sidebar />);
