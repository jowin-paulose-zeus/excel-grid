import { Grid } from "./core/Grid";
import "./style.css"
const canvas = document.createElement("canvas");

canvas.width = 1920;
canvas.height = 1080;

document.body.appendChild(canvas);

const grid = new Grid(canvas);

grid.initialize();