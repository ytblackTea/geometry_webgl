import { cross } from './public/utils.js'

export const geometry = {
    cube: (w, center) => {
        // 计算立方体顶点
        const halfW = w / 2;
        const [x, y, z] = center;
        const a = [x - halfW, y + halfW, z + halfW];
        const b = [x + halfW, y + halfW, z + halfW];
        const c = [x - halfW, y - halfW, z + halfW];
        const d = [x + halfW, y - halfW, z + halfW];
        const e = [x - halfW, y + halfW, z - halfW];
        const f = [x + halfW, y + halfW, z - halfW];
        const g = [x - halfW, y - halfW, z - halfW];
        const h = [x + halfW, y - halfW, z - halfW];

        //正面
        let vectorBA = [-2 * halfW, 0, 0];
        let vectorAC = [0, -2 * halfW, 0];

        //右侧
        let vectorFB = [0, 0, 2 * halfW];
        let vectorBD = [0, -2 * halfW, 0];

        // 上面
        let vectorFE = [], vectorEA = [];
        glMatrix.vec3.sub(vectorFE, e, f);
        glMatrix.vec3.sub(vectorEA, a, e)
        // let vectorEA = [0, 0, -2 * halfW];

        // 正面法向量
        let vectorABCD = [];
        cross(vectorABCD, vectorBA, vectorAC);
        // 右侧法向量
        let vectorBFDH = [];
        cross(vectorBFDH, vectorFB, vectorBD);
        // 上面法向量
        let vectorABEF = [];
        cross(vectorABEF, vectorFE, vectorEA);

        const vectorArr = [
            // 正面
            ...a, ...vectorABCD, 1, 0, 0,
            ...b, ...vectorABCD, 1, 0, 0,
            ...c, ...vectorABCD, 1, 0, 0,
            ...d, ...vectorABCD, 1, 0, 0,
            // 右面
            ...b, ...vectorBFDH, 1, 0, 0,
            ...f, ...vectorBFDH, 1, 0, 0,
            ...d, ...vectorBFDH, 1, 0, 0,
            ...h, ...vectorBFDH, 1, 0, 0,
            // 后面
            ...f, -vectorABCD[0], -vectorABCD[1], -vectorABCD[2], 1, 0, 0,
            ...e, -vectorABCD[0], -vectorABCD[1], -vectorABCD[2], 1, 0, 0,
            ...h, -vectorABCD[0], -vectorABCD[1], -vectorABCD[2], 1, 0, 0,
            ...g, -vectorABCD[0], -vectorABCD[1], -vectorABCD[2], 1, 0, 0,
            // 左面
            ...e, -vectorBFDH[0], -vectorBFDH[1], -vectorBFDH[2], 1, 0, 0,
            ...a, -vectorBFDH[0], -vectorBFDH[1], -vectorBFDH[2], 1, 0, 0,
            ...g, -vectorBFDH[0], -vectorBFDH[1], -vectorBFDH[2], 1, 0, 0,
            ...c, -vectorBFDH[0], -vectorBFDH[1], -vectorBFDH[2], 1, 0, 0,
            // 上面
            ...e, ...vectorABEF, 1, 0, 0,
            ...f, ...vectorABEF, 1, 0, 0,
            ...a, ...vectorABEF, 1, 0, 0,
            ...b, ...vectorABEF, 1, 0, 0,
            // 底面
            ...c, -vectorABEF[0], -vectorABEF[1], -vectorABEF[2], 1, 0, 0,
            ...d, -vectorABEF[0], -vectorABEF[1], -vectorABEF[2], 1, 0, 0,
            ...g, -vectorABEF[0], -vectorABEF[1], -vectorABEF[2], 1, 0, 0,
            ...h, -vectorABEF[0], -vectorABEF[1], -vectorABEF[2], 1, 0, 0,
        ]

        let indics = []
        for (let i = 0; i < 6; i++) {
            const baseIndex = 4 * i;
            indics.push(
                0 + baseIndex, 1 + baseIndex, 3 + baseIndex,
                3 + baseIndex, 2 + baseIndex, 0 + baseIndex
            )
        }
        return { vectorArr, indics }
    },
    sphere: (r, center, latitude, longitude) => {
        // 绘制球体(半径、球体中心、纬度、经度)
        // 假设偏移10度为一个点，R=r*cos(longitude) x=R*cos(latitude)，y=R*sin(longitude) z= R*sin(latitude)
        let vectorArr = []
        let rad = Math.PI / 180
        for (let i = 0; i <= 180; i += latitude) {
            let R = r * Math.abs(Math.sin(i * rad))
            for (let j = 0; j <= 360; j += longitude) {
                vectorArr.push(
                    R * Math.cos(j * rad) + center[0],
                    r * Math.cos(i * rad) + center[1],
                    R * Math.sin(j * rad) + center[2],
                    //每个点的法向量
                    R * Math.cos(j * rad),
                    r * Math.cos(i * rad),
                    R * Math.sin(j * rad),
                    //点的颜色
                    0, 1, 0,
                )
            }
        }
        let indics = [];
        let countLev = 360 / longitude;
        for (let i = 0; i < vectorArr.length / 9 - countLev - 1; i++) {
            indics.push(
                i, i + 1, i + countLev + 1,
                i + countLev + 1, i + countLev, i
            )
        }

        // console.log(indics, vectorArr)
        return { indics, vectorArr }
    },
    cone: (center, angle, r, height) => {
        // 中心、角度、半径、顶点
        // console.log(center, angle, r, sharp)
        // 底面圆上点坐标值 x=r*Math.cos(rad),y=0,z=r*Math.sin(rad)
        let rad = Math.PI / 180
        // 计算顶点坐标
        // let sharp = [center[0], center[1] + height, center[2]]
        // 默认为上面第一个顶点
        // let vectorArr = [center[0], center[1] + height, center[2], 0, 0, 1, 0, 0, 1]
        let indics = [], vectorArr = [];
        let count = 0;
        for (let i = 0; i <= 360; i += angle) {
            let vectorAB = [
                r * Math.cos(rad * i),
                -height,
                r * Math.sin(rad * i),
            ]
            let vectorCB = [
                r * Math.cos(rad * i) - r * Math.cos(rad * (i + angle)),
                0,
                r * Math.sin(rad * i) - r * Math.sin(rad * (i + angle)),
            ]
            let normalArr = [];
            cross(normalArr, vectorAB, vectorCB)
            vectorArr.push(
                r * Math.cos(rad * i) + center[0],
                0 + center[1],
                r * Math.sin(rad * i) + center[2],
                ...normalArr,//点的法向量
                0, 0, 1,//点的颜色
            )
            vectorArr.push(
                center[0],
                center[1] + height,
                center[2],
                ...normalArr,//点的法向量
                0, 0, 1,//点的颜色
            )
            vectorArr.push(
                r * Math.cos(rad * (i + angle)) + center[0],
                0 + center[1],
                r * Math.sin(rad * (i + angle)) + center[2],
                ...normalArr,//点的法向量
                0, 0, 1,//点的颜色
            )
            indics.push(count, count + 1, count + 2)
            count += 3
        }
        // 顶点个数
        let vertexLen = vectorArr.length / 9;
        let curLen = vertexLen;
        // 底面
        for (let i = 0; i <= 360; i += angle) {
            vectorArr.push(
                r * Math.cos(rad * i) + center[0],
                0 + center[1],
                r * Math.sin(rad * i) + center[2],
                0, -1, 0,//点的法向量
                0, 0, 1,//点的颜色
            )
            if (curLen < 360 / angle - 2 + vertexLen) {
                indics.push(vertexLen, curLen + 1, curLen + 2)
            }
            curLen += 1
        }
        // console.log(vectorArr, indics, '椎体')

        return { vectorArr, indics }
    },
    ground: () => {
        let vectorArr = [
            -5, -1, -5, 0, 1, 0, 0, 0, 0.5,
            5, -1, -5, 0, 1, 0, 0, 0, 0.5,
            5, -1, 5, 0, 1, 0, 0, 0, 0.5,
            -5, -1, 5, 0, 1, 0, 0, 0, 0.5,
        ]

        let indics = [
            0, 1, 2,
            2, 3, 0
        ]

        return {
            vectorArr,
            indics
        }
    },
    mergeData: (geoA, geoB, size) => {
        // 合并顶点坐标、计算索引
        let vectorArr = []
        vectorArr = geoA.vectorArr.concat(geoB.vectorArr)

        let indics = geoA.indics
        let vectorALen = geoA.vectorArr.length / size

        for (let i = 0; i < geoB.indics.length; i++) {
            indics.push(geoB.indics[i] + vectorALen)
        }
        return { vectorArr, indics }
    }
}


// // 顶点着色器
// const vertexShader = `
// attribute vec3 a_position;
// attribute vec3 a_normal;
// attribute vec3 a_color;

// uniform mat4 u_matrix;

// varying vec3 color;
// varying vec3 normal;
// varying vec3 v_position;

// void main(){
//     // 将位置和矩阵相乘
//     gl_Position = u_matrix * vec4(a_position, 1);
//     color = a_color;
//     normal = a_normal;
//     v_position = a_position;
// }
// `

// // 片元着色器
// const fragmentShader = `
// precision mediump float;

// varying vec3 color;
// varying vec3 normal;
// varying vec3 v_position;

// uniform vec3 v_lightPos;

// float PI = 3.141592654;
// void main () {
//     // 光强
//     float intensity = 1.5;
//     // 光的颜色
//     vec3 lightColor = vec3(1,1,1);
//     // 光的方向
//     vec3 lightDir = normalize(vec3(1,-1,0));
//     // 计算光照与法向量的角度 归一化
//     float rad = acos(dot(normalize(normal),lightDir))/PI;
//     // 归一化rad
//     vec3 lic = rad*intensity*lightColor;
//     // 光源到物体的距离
//     float dist = distance(v_position,v_lightPos);

//     gl_FragColor = vec4(dist/20.0,dist/20.0,dist/20.0,1);

// }
// `;

//  // 计算点距离光源的位置，与framebuffer里面的数据进行对比
//  distance(a_position,v_lightPos)  s_framebuffer[glPosition]