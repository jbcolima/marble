import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = Boolean(process.env.ELECTRON_START_URL || process.env.VITE_DEV_SERVER_URL);

function createWindow() {
	console.log('[electron] creating window. isDev=', isDev);
	const win = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true
		}
	});

	if (isDev) {
		const url = process.env.ELECTRON_START_URL || process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
		console.log('[electron] loading dev server:', url);
		win.loadURL(url);
		win.webContents.openDevTools({ mode: 'detach' });
	} else {
		const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
		console.log('[electron] loading file:', indexPath);
		win.loadFile(indexPath);
	}
}

app.whenReady().then(() => {
	console.log('[electron] app ready');
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});
