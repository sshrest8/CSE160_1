// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        //gl_PointSize = 30.0;
        gl_PointSize = u_Size;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor; 
    void main() {
        gl_FragColor = u_FragColor;
    }`;

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGl(){
    // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true})
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.BLEND);
  gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
}

function connectVariablesToGLSL(){
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// GLobal related UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_segments=5;


// Set up actions for the HTML UI Elements
function addActionsForHtmlUI(){
    // Button Events (Shape Type)
    document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0];};
    document.getElementById('red').onclick = function() { g_selectedColor = [1.0,0.0,0.0,1.0];};
    document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes();};

    document.getElementById('pointButton').onclick = function() { g_selectedType=POINT};
    document.getElementById('triButton').onclick = function() { g_selectedType=TRIANGLE};
    document.getElementById('circleButton').onclick = function() { g_selectedType=CIRCLE};

    document.getElementById('cap').onclick = drawCap;

    // Slider Events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });
    document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_segments= this.value; });

    document.getElementById('opacitySlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value/100; });
    // Size Slider Events
    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

}   

function main() {
  
    setupWebGl();
    connectVariablesToGLSL()
    // Set up actions for the HTML UI elements 
    addActionsForHtmlUI();
    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    //canvas.onmousemove = click;
    
    canvas.onmousemove = function(ev){ if(ev.buttons == 1) {click(ev)} };


    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    // drawCap();
}



var g_shapesList = [];
// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];


function click(ev) {
    let [x,y] = convertCoordinatesEventToGL(ev);

    // Create and store the new point
    let point;
    if (g_selectedType==POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE){
        point = new Triangle();
    } else {
        point = new Circle();
        point.segments = g_segments;

    }
    point.position=[x,y];
    point.color=g_selectedColor.slice();
    point.size=g_selectedSize;
    
    g_shapesList.push(point);

    // // Store the coordinates to g_points array
    // g_points.push([x, y]);
    // // Store the color to g_colors array
    // g_colors.push(g_selectedColor.slice()); 

    // // Store the size to the g_sizes array
    // g_sizes.push(g_selectedSize);

    // if (x >= 0.0 && y >= 0.0) {      // First quadrant
    //     g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
    // } else if (x < 0.0 && y < 0.0) { // Third quadrant
    //     g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
    // } else {                         // Others
    //     g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
    // }
    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
    return ([x,y]);
}

function renderAllShapes(){
    // Check the time at the start of the function
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    //var len = g_points.length;

    var len = g_shapesList.length;
    for(var i = 0; i < len; i++) {
        // var xy = g_shapesList[i].position;
        // var rgba = g_shapesList[i].color;
        // var size = g_shapesList[i].size;
    

        // // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
        // // Pass the color of a point to u_FragColor variable
        // gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // gl.uniform1f(u_Size, size);
        // // Draw
        // gl.drawArrays(gl.POINTS, 0, 1);
        g_shapesList[i].render();
    }

    // Check the time at the end of the function, and show on the webpage
    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

// Set the text of a HTML element
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm){
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}

function drawCap() {
    let circle1 = new Circle();
    let circle2 = new Circle();
    let circle3 = new Circle();
    let circle4 = new Circle();
    let red = [186/255,53/255,48/255,1.0];
    let silver = [208/255,207/255,210/255, 1.0];
    let blue = [17/255,72/255,150/255, 1.0]
    let triangle1 = new Triangle();
    let triangle2 = new Triangle();
    let triangle3 = new Triangle();
    let triangle4 = new Triangle();
    let triangle5 = new Triangle();
    circle1.color = red;
    circle1.size = 190;


    circle2.color = silver;
    circle2.size = 155;

    circle3.color = red;
    circle3.size = 115;

    circle4.color = blue;
    circle4.size = 70;

    circle1.segments = 100;
    circle2.segments = 100;
    circle3.segments = 100;
    circle4.segments = 100;

    g_shapesList.push(circle1);
    g_shapesList.push(circle2);
    g_shapesList.push(circle3);
    g_shapesList.push(circle4);

    renderAllShapes();
    gl.uniform4f(u_FragColor, silver[0], silver[1], silver[2], silver[3]);
    drawTriangle([-0.15,-0.1,0.15,-0.1,0,0.35]);

    drawTriangle([-0.10,-0.1,-0.05,0.1,-0.33,0.1]);

    drawTriangle([0.10,-0.1,0.05,0.1,0.33,0.1]);

    drawTriangle([-0.15,-0.1,0.05,-0.1,-0.195,-0.295]);

    drawTriangle([0.15,-0.1,-0.05,-0.1,0.195,-0.295]);
    
}