import { Grid } from "./core/Grid";
import "./style.css";
const canvas = document.createElement("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.tabIndex =0;

document.body.appendChild(canvas);

const grid = new Grid(canvas);

grid.initialize();
