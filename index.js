import { initWebGL } from './public/utils.js'
const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')
import { geometry } from './geometry.js'
// 顶点着色器
const vertexShader = `
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_color;

uniform mat4 u_matrix;

varying vec3 color;
varying vec3 normal;

void main(){
    // 将位置和矩阵相乘
    gl_Position = u_matrix * vec4(a_position, 1);
    color = a_color;
    normal = a_normal;
}
`

// 片元着色器
const fragmentShader = `
precision mediump float;

varying vec3 color;
varying vec3 normal;

float PI = 3.141592654;
void main () {
    // 光强
    float intensity = 1.5;
    // 光的颜色
    vec3 lightColor = vec3(1,1,1);
    // 光的方向
    vec3 lightDir = normalize(vec3(1,-1,0));
    // 计算光照与法向量的角度 归一化
    float rad = acos(dot(normalize(normal),lightDir))/PI;
    // 归一化rad
    vec3 lic = rad*intensity*lightColor;
    gl_FragColor = vec4(lic*color,1);

}
`;
// 创建shader
const program = initWebGL(gl, vertexShader, fragmentShader)
var uints_for_indices = gl.getExtension("OES_element_index_uint");

// 使用program
gl.useProgram(program)
// 计算立方体顶点

// 获取立方体顶点数据 宽度、中心
const cube = geometry.cube(1, [0, 0.5, -1])
// 半径、球体中心、纬度、经度
const sphere = geometry.sphere(0.5, [-0.5, 0, -0.5], 10, 10)
// 中心、角度、半径、高度
const cone = geometry.cone([1, 0, -0.7], 1, 0.3, 0.5)
// 绘制地面
const ground = geometry.ground()


const mergeBuffer1 = geometry.mergeData(cube, sphere, 9)
const mergeBuffer2 = geometry.mergeData(mergeBuffer1, cone, 9)
const mergeBuffer = geometry.mergeData(mergeBuffer2, ground, 9)
// console.log(mergeBuffer, 'mergeBuffer')



let a_position = gl.getAttribLocation(program, 'a_position')
let normalLocation = gl.getAttribLocation(program, "a_normal");
let a_color = gl.getAttribLocation(program, 'a_color')

let matrixLocation = gl.getUniformLocation(program, "u_matrix");

// 创建缓冲存储法向量
// const normalBuffer = gl.createBuffer();
// 绑定到 ARRAY_BUFFER (可以看作 ARRAY_BUFFER = normalBuffer)
// gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
// 将法向量存入缓冲
// setNormals(gl);

// 创建缓冲区对象
const buffer = gl.createBuffer();
// 绑定缓冲区对象
gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
//顶点数组data数据传入缓冲区
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(mergeBuffer.vectorArr), gl.STATIC_DRAW);

// 创建缓冲区
const indexsBuffer = gl.createBuffer();
// 绑定buffer ELEMENT_ARRAY_BUFFER
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexsBuffer);
// 缓冲区存数据
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(mergeBuffer.indics), gl.STATIC_DRAW);

gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);
gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);
gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);

// 深度测试
gl.enable(gl.DEPTH_TEST);
// 开启从缓冲中获取数据
gl.enableVertexAttribArray(a_position);
gl.enableVertexAttribArray(a_color);
// 启用法向量属性
gl.enableVertexAttribArray(normalLocation);

var translation = [0, 0, 1];
var rotation = [0, 1, 0];

// 计算角度对应的弧度
function degToRad(d) {
    return d * Math.PI / 180;
}

var fieldOfViewRadians = degToRad(100);
// TRIANGLES   (mode,count,type,offset)
var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
var zNear = 0.5;
var zFar = 1000;
// 绘制
function drawGeometry(dataArr) {
    let mat4 = glMatrix.mat4;
    let matrix = [];
    mat4.perspective(matrix, fieldOfViewRadians, aspect, zNear, zFar);
    const look = [];
    mat4.lookAt(look, translation, [0, 0, -1], [0, 1, 0])
    mat4.mul(matrix, matrix, look);
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    gl.drawElements(gl.TRIANGLES, dataArr.length, gl.UNSIGNED_INT, 0);
}

let isPress = false, pos = [0, 0];
document.body.addEventListener('mousedown', (e) => {
    isPress = true;
    pos = [e.clientX, e.clientY]
})
document.body.addEventListener('mousemove', (e) => {
    if (isPress) {
        translation = [
            translation[0] - (e.clientX - pos[0]) / 100,
            translation[1] + (e.clientY - pos[1]) / 100,
            translation[2]
        ]
        pos = [e.clientX, e.clientY]
        drawGeometry(mergeBuffer.indics)
    }
})
document.body.addEventListener('mouseup', () => {
    isPress = false
})


drawGeometry(mergeBuffer.indics)