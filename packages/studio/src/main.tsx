import React from 'react';
import { createRoot } from 'react-dom/client';
import { StudioApp } from './studio';
// Import Tailwind CSS base styles
import './index.css';
// Import AIP theme CSS
import '../../agentinterface/dist/theme.css';

const container = document.getElementById('root');
if (!container) throw new Error('Failed to find the root element');

const root = createRoot(container);
root.render(<StudioApp />);