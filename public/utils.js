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

// 创建纹理
export function create_Texture(cWidth,cHeight,gl) {
    // 创建渲染对象
    const targetTextureWidth = cWidth;
    const targetTextureHeight = cHeight;
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    // 定义 0 级的大小和格式
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        targetTextureWidth, targetTextureHeight, border,
        format, type, data);

    // 设置筛选器，不需要使用贴图
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return targetTexture
}

// 创建framebuffer
export function createFb(gl,targetTexture) {
    // 创建并绑定帧缓冲
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    // 附加纹理为第一个颜色附件
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, 0);
        return fb;
}