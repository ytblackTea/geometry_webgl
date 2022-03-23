import {initWebGL} from './public/utils.js'

// 阴影着色器
const shadowShader = `
    attribute vec4 a_position;
    uniform mat4 u_FinalMatrix*a)position;

    void main(){
        gl_Position = u_FinalMatrix*a_Position;
    }
`

const shadowFragment = `
    precision mediump float;
    void main(){
        gl_FragColor = vec4(gl_FragCoord.z,0.0,0.0,0.0);
    }
`