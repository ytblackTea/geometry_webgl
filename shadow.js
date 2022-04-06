import { initWebGL, create_Texture, createFb } from './public/utils.js'
const canvas = document.getElementById('canvas')
const gl = canvas.getContext('webgl')
import { geometry } from './geometry.js'
function shadow() {
    // 计算光源到物体距离  
    const shawdowVertex = `
    attribute vec3 s_position;
    attribute vec3 a_color;
// 摄像机位置
uniform mat4 c_matrix;

varying vec3 v_position;
varying vec3 v_color;
void main(){
    // 将位置和矩阵相乘
    gl_Position = c_matrix * vec4(s_position, 1);
    v_position = s_position;
    v_color = a_color;
}
`
    // 片元着色器
    const shawdowFragment = `
precision mediump float;

varying vec3 v_position;
varying vec3 v_color;
uniform vec3 v_lightPos;

void main () {
    vec4 bitShift = vec4(1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0);
    vec4 bitMask = vec4(1.0/256.0, 1.0/256.0, 1.0/256.0, 0.0);
    vec4 rgbaDepth = fract(gl_FragCoord.z * bitShift);
    rgbaDepth -= rgbaDepth.gbaa * bitMask;
    // 光源到物体的距离
    float dist = distance(v_position,v_lightPos) / 10.0;

    gl_FragColor = vec4(dist,0,0,1);
    gl_FragColor = vec4(v_color, 1);
}
`;

    // 创建阴影
    const programShadow = initWebGL(gl, shawdowVertex, shawdowFragment);
    var uints_for_indices = gl.getExtension("OES_element_index_uint");

    // 使用program
    gl.useProgram(programShadow);

    // 获取立方体顶点数据 宽度、中心
    const cube = geometry.cube(1, [0, 2.5, -0.5]);
    // 半径、球体中心、纬度、经度
    const sphere = geometry.sphere(0.5, [-0.5, 0, -0.5], 10, 10);
    // 中心、角度、半径、高度
    const cone = geometry.cone([1, 0, -0.7], 1, 0.3, 0.5);
    // 绘制地面
    const ground = geometry.ground();


    const mergeBuffer1 = geometry.mergeData(cube, sphere, 9)
    const mergeBuffer2 = geometry.mergeData(mergeBuffer1, cone, 9)
    const mergeBuffer = geometry.mergeData(mergeBuffer2, ground, 9)

    let s_position = gl.getAttribLocation(programShadow, 's_position');
    let a_color = gl.getAttribLocation(programShadow, 'a_color');
    let c_matrix = gl.getUniformLocation(programShadow, 'c_matrix');
    let v_lightPos = gl.getUniformLocation(programShadow, 'v_lightPos');

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

    // 创建纹理
    let texture = create_Texture(gl.canvas.clientWidth, gl.canvas.clientHeight, gl)
    window.texture = texture;

    // 创建framebuffer
    // const fb = createFb(gl, texture)
    gl.vertexAttribPointer(s_position, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 0);
    gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 9 * Float32Array.BYTES_PER_ELEMENT, 6 * Float32Array.BYTES_PER_ELEMENT);

    gl.enableVertexAttribArray(s_position);
    gl.enableVertexAttribArray(a_color);


    // 计算角度对应的弧度
    function degToRad(d) {
        return d * Math.PI / 180;
    }
    var fieldOfViewRadians = degToRad(60);
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.5;
    var zFar = 1000;
    // 绘制场景
    function drawFramebuffer(dataArr) {
        // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CW);
        gl.cullFace(gl.BACK);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);

        gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight); // 设置视口为当前画布的大小
        gl.clearColor(0.0, 1.0, 0.0, 1);
        // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // Clear the color buffer
        // gl.clear(gl.DEPTH_BUFFER_BIT); // Clear the color buffer
        gl.clearDepth(0);
        // gl.clearColor();

        let mat4 = glMatrix.mat4;
        let matrix = [];
        mat4.perspective(matrix, fieldOfViewRadians, aspect, zNear, zFar);
        const look = [];
        // 光源位置
        let lightPos = [0, 5, 0];
        mat4.lookAt(look, lightPos, [0, -100, 0], [1, 0, 0])
        mat4.mul(matrix, matrix, look);
        gl.uniformMatrix4fv(c_matrix, false, matrix);
        console.log(matrix)
        // 传入相机的位置
        gl.uniform3f(v_lightPos, lightPos[0], lightPos[1], lightPos[2]);
        gl.drawElements(gl.TRIANGLES, dataArr.length, gl.UNSIGNED_INT, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    drawFramebuffer(mergeBuffer.indics)
}
shadow();
export default shadow
