var paintcanvas = document.getElementById("canvas1");
var context = paintcanvas.getContext("2d");

var color = 'black';
var radius = 50;
var opacity = 1;
var isPainting = false;
var isEraser = false;

var canvasHistory = [];
var undoHistory = [];

// Set Width & Height
function setWidth(value) {
    if (isNumeric(value)) {
        paintcanvas.width = value;
        saveState();
    }
}

function setHeight(value) {
    if (isNumeric(value)) {
        paintcanvas.height = value;
        saveState();
    }
}

// Brush Painting
function startPaint() {
    isPainting = true;
}

function doPaint(x, y) {
    if (isPainting) {
        paintCircle(x, y);
    }
}

function endPaint() {
    isPainting = false;
    saveState();
}

function changeColor(newColor) {
    color = newColor;
    updateBrushPreview();
}

function clearCanvas() {
    context.clearRect(0, 0, paintcanvas.width, paintcanvas.height);
    saveState();
}

function resizeBrush(newSize) {
    radius = newSize;
    document.getElementById("sizeOutput").value = newSize;
    updateBrushPreview();
}

function paintCircle(x, y) {
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2, true);
    context.fillStyle = isEraser ? '#ffffff' : color;
    context.globalAlpha = opacity;
    context.fill();
}

function isNumeric(value) {
    return !isNaN(value);
}

// Eraser functionality
function setEraser() {
    isEraser = true;
    paintcanvas.classList.add('cursor-eraser');
    paintcanvas.classList.remove('cursor-brush');
}

function setBrush() {
    isEraser = false;
    paintcanvas.classList.add('cursor-brush');
    paintcanvas.classList.remove('cursor-eraser');
}

// Undo and Redo functionality
function saveState() {
    canvasHistory.push(context.getImageData(0, 0, paintcanvas.width, paintcanvas.height));
    undoHistory = [];
}

function undo() {
    if (canvasHistory.length > 0) {
        undoHistory.push(canvasHistory.pop());
        context.putImageData(canvasHistory[canvasHistory.length - 1], 0, 0);
    }
}

function redo() {
    if (undoHistory.length > 0) {
        canvasHistory.push(undoHistory.pop());
        context.putImageData(canvasHistory[canvasHistory.length - 1], 0, 0);
    }
}

// Opacity control
function changeOpacity(newOpacity) {
    opacity = newOpacity;
}

// Upload background image
function uploadBackground() {
    var img = new Image();
    var file = document.getElementById("backgroundImage").files[0];
    var reader = new FileReader();
    document.getElementById("loading-spinner").style.display = "block"; // Show spinner
    
    reader.onload = function(e) {
        img.src = e.target.result;
        img.onload = function() {
            document.body.style.backgroundImage = `url(${e.target.result})`;
            document.getElementById("loading-spinner").style.display = "none"; // Hide spinner
            saveState();
        };
    };
    reader.readAsDataURL(file);
}

function clearBackground() {
    document.body.style.backgroundImage = 'none';
}

// Brush Preview Update
function updateBrushPreview() {
    const preview = document.getElementById("brush-preview");
    preview.style.width = radius + "px";
    preview.style.height = radius + "px";
    preview.style.backgroundColor = color;
}

// Theme Toggle
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
}

// Save and Load Canvas State
function saveCanvasState() {
    var link = document.createElement('a');
    link.download = 'canvas-state.json';
    link.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(canvasHistory));
    link.click();
}

function loadCanvasState(file) {
    var reader = new FileReader();
    reader.onload = function(event) {
        var data = JSON.parse(event.target.result);
        canvasHistory = data;
        context.putImageData(canvasHistory[canvasHistory.length - 1], 0, 0);
    };
    reader.readAsText(file);
}

// Save user preferences in LocalStorage
window.onbeforeunload = function() {
    localStorage.setItem('color', color);
    localStorage.setItem('radius', radius);
    localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
};

// Load preferences when page is loaded
window.onload = function() {
    if (localStorage.getItem('color')) {
        changeColor(localStorage.getItem('color'));
    }
    if (localStorage.getItem('radius')) {
        resizeBrush(localStorage.getItem('radius'));
    }
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
};
