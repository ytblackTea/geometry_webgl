export function initWebGL(gl, vertexSource, fragmentSource) {
    // 创建顶点着色器
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    // 创建片元着色器
    let fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentSource
    );
    // 创建program
    let program = createProgram(gl, vertexShader, fragmentShader);

    return program;
}

//创建shader
function createShader(gl, type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }
    // console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// 创建program
function createProgram(gl, vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }
}

// 叉乘
export function cross(out, a, b) {
    let ax = a[0],
      ay = a[1],
      az = a[2];
    let bx = b[0],
      by = b[1],
      bz = b[2];
    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }