import { createState } from './state.js';
import { hookUI } from './ui.js';
import { attachInput, startLoop } from './game.js';
import { snapshotFactory } from './weapons.js';

const app = createState();
app.canvas = document.getElementById('game');
app.ctx = app.canvas.getContext('2d');
function resize(){ app.canvas.width=innerWidth; app.canvas.height=innerHeight; app.ctx.imageSmoothingEnabled=false; }
addEventListener('resize', resize); resize();

hookUI(app);
attachInput(app);

document.getElementById('mainmenu').style.display='flex';

startLoop(app);
