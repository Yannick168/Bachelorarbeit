"use client"

import * as React from 'react'
import { compileShaderProgram, resizeCanvas, useForceUpdate } from '@/utility'

import { Matrix4, Vector3, Quaternion, Vector2, Vector4 } from '@math.gl/core'

import RayVS from './ray.vs.glsl'
import RayFS from './ray.fs.glsl'

import 'webgl-lint'
import { Panel } from '@/ui/panel'
import { Label } from '@/ui/label'
import { MultiSwitch, MultiSwitchElement } from '@/ui/multi-switch'
import { mouseToTrackball, trackball } from '../06-Parametric-Surfaces/utility'
// import { mouseToTrackball, trackball } from '@/utility'

type AppContext = {
    gl: WebGL2RenderingContext;

    cube: UnitCube;
    program: WebGLProgram;

    modelView: Matrix4;
    projection: Matrix4;

    mousePos: Vector2;
    mousePressed: boolean;

    aspect: number;
    zoom: number;

    viewMode: number;
    curSurface: number;
    qNow: Quaternion;
}

type UnitCube = {
    vao: WebGLVertexArrayObject;
    iboSize: number;
    type: "UnitCube";
}

export const createUnitCube = (
    ctx: {
        gl: WebGL2RenderingContext,
        program: WebGLProgram
    }
): UnitCube => {

    const gl = ctx.gl;

    let vbo = [-1, -1, -1,
        1, -1, -1,
    -1, 1, -1,
        1, 1, -1,
    -1, -1, 1,
        1, -1, 1,
    -1, 1, 1,
        1, 1, 1];

    let ibo = [0, 2, 1, 1, 2, 3, 4, 5, 6, 6, 5, 7, 0, 5, 4, 0, 1, 5, 2, 6, 7, 2, 7, 3, 7, 1, 3, 7, 5, 1, 0, 6, 2, 0, 4, 6];

    const iboSize = ibo.length;

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vbo), gl.STATIC_DRAW);
    const positionAttributeLocation = gl.getAttribLocation(ctx.program, 'aPosition');
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    const iboBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iboBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ibo), gl.STATIC_DRAW);

    return { vao, iboSize, type: "UnitCube" };
}

const drawUnitCube = (cube: UnitCube, ctx: AppContext) => {
    const gl = ctx.gl;
    const program = ctx.program;

    const projectionLoc = gl.getUniformLocation(program, 'uProjection');
    gl.uniformMatrix4fv(projectionLoc, false, ctx.projection);
    const modelViewLoc = gl.getUniformLocation(program, 'uModelView');
    const modelInvLoc = gl.getUniformLocation(program, 'uModelInverse');
    const orthoLoc = gl.getUniformLocation(program, 'uOrthographic');
    const surfaceLoc = gl.getUniformLocation(program, 'uSurface');
    gl.uniform1i(surfaceLoc, ctx.curSurface);

    if (ctx.viewMode == 1)
        gl.uniform1i(orthoLoc, 1);
    else
        gl.uniform1i(orthoLoc, 0);

    gl.bindVertexArray(cube.vao);

    const M = new Matrix4();
    M.copy(ctx.modelView).invert();

    gl.uniformMatrix4fv(modelViewLoc, false, ctx.modelView);
    gl.uniformMatrix4fv(modelInvLoc, false, M);
    gl.drawElements(gl.TRIANGLES, cube.iboSize, gl.UNSIGNED_SHORT, 0);
}

const App = () => {
    const canvas = React.useRef<HTMLCanvasElement>(null)
    const context = React.useRef<AppContext>();
    const renderUI = useForceUpdate();

    const mouseDown = (event: MouseEvent): void => {
        if (!context.current) return;
        const ctx = context.current;
        ctx.mousePressed = true;
        ctx.mousePos = new Vector2(event.clientX, event.clientY);
    }

    const mouseUp = (event: MouseEvent): void => {
        if (!context.current) return;
        const ctx = context.current;
        ctx.mousePressed = false;
    }

    const mouseMove = (event: MouseEvent) => {

        if (!context.current) return;
        const ctx = context.current;

        if (ctx.mousePressed) {
            const newPos = new Vector2(event.clientX, event.clientY);
            let p0 = mouseToTrackball(ctx.gl, ctx.mousePos);
            let p1 = mouseToTrackball(ctx.gl, newPos);

            ctx.qNow.multiplyLeft(trackball(p0, p1));
            ctx.qNow.normalize();

            // console.log('Move',event.button,event.clientX, event.clientY);
            ctx.mousePos = newPos;
            drawScene();
        }
    }

    const mouseWheel = (event: WheelEvent) => {
        if (!context.current) return;
        const ctx = context.current;

        if (event.deltaY > 0.0) ctx.zoom *= 1.1; else ctx.zoom /= 1.1;
        // console.log('Wheel',event.deltaY,event.clientX, event.clientY);
        drawScene();
    }

    const drawScene = () => {

        if (!context.current) return;
        const ctx = context.current;
        const gl = ctx.gl;
        const modelView = ctx.modelView;
        const zoom = ctx.zoom;
        const viewMode = ctx.viewMode;
        const qNow = ctx.qNow;

        const mynear = 10;
        const myfar = 100;
        const aspect = gl.canvas.width / gl.canvas.height;
        const displayHeight = 30;
        const displayWidth = aspect * displayHeight;
        let camX = 0;
        let camY = 0;
        let camZ = 50;
        let left = mynear * (-displayWidth / 2 - camX) / camZ;
        let right = mynear * (displayWidth / 2 - camX) / camZ;
        let bottom = mynear * (-displayHeight / 2 - camY) / camZ;
        let top = mynear * (displayHeight / 2 - camY) / camZ;

        ctx.projection.identity();
        modelView.identity();

        if (viewMode == 1) {
            ctx.projection = new Matrix4().ortho(
                {
                    left: -displayWidth / 2, right: displayWidth / 2,
                    bottom: -displayHeight / 2, top: displayHeight / 2,
                    near: mynear, far: myfar
                });
        }
        if (viewMode == 2) {
            ctx.projection = new Matrix4().frustum(
                {
                    'left': left, 'right': right,
                    'bottom': bottom, 'top': top,
                    'near': mynear, 'far': myfar
                });
        }
        ctx.modelView.translate([-camX, -camY, -camZ]);

        camX = -3;
        left = mynear * (-displayWidth / 2 - camX) / camZ;
        right = mynear * (displayWidth / 2 - camX) / camZ;
        bottom = mynear * (-displayHeight / 2 - camY) / camZ;
        top = mynear * (displayHeight / 2 - camY) / camZ;

        const PLeft = new Matrix4();
        PLeft.frustum({
            'left': left, 'right': right,
            'bottom': bottom, 'top': top,
            'near': mynear, 'far': myfar
        });
        const MLeft = new Matrix4().identity().translate([-camX, -camY, -camZ]);

        camX = 3;
        left = mynear * (-displayWidth / 2 - camX) / camZ;
        right = mynear * (displayWidth / 2 - camX) / camZ;
        bottom = mynear * (-displayHeight / 2 - camY) / camZ;
        top = mynear * (displayHeight / 2 - camY) / camZ;

        const PRight = new Matrix4();
        PRight.frustum({
            'left': left, 'right': right,
            'bottom': bottom, 'top': top,
            'near': mynear, 'far': myfar
        });
        const MRight = new Matrix4().identity().translate([-camX, -camY, -camZ]);

        const M = new Matrix4().fromQuaternion(qNow);
        M.scale([zoom, zoom, zoom]);
        M.scale([15, 15, 15]);

        // let colorLoc = gl.getUniformLocation(program, 'uColor');
        // gl.uniform3fv(colorLoc, [1, 1, 1]);

        gl.colorMask(true, true, true, true);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        if (viewMode == 3) {
            gl.colorMask(true, false, false, true);
            ctx.projection = PLeft;
            ctx.modelView = MLeft.multiplyRight(M);
            drawUnitCube(ctx.cube, ctx);

            gl.clear(gl.DEPTH_BUFFER_BIT);

            gl.colorMask(false, true, true, true);
            ctx.projection = PRight;
            ctx.modelView = MRight.multiplyRight(M);
            drawUnitCube(ctx.cube, ctx);
        } else {
            ctx.modelView.multiplyRight(M);
            drawUnitCube(ctx.cube, ctx);
        }
    }

    const init = async () => {
        // Initialize WebGL2 Context / OpenGL ES 3.0
        const gl = canvas.current!.getContext('webgl2', { antialias: true })
        if (!gl) return;

        // Load the vertex and fragment shader source code
        const program = compileShaderProgram(gl, RayVS, RayFS);
        gl.useProgram(program);

        const cube = createUnitCube({ gl, program });

        // gl.clearColor(0, 0, 0, 1);
        gl.clearColor(0.5, 0.5, 0.5, 1);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);

        const resizeHandler = () => {
            // const ctx = contextRef.current;
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            // ctx.aspect = gl.canvas.width / gl.canvas.height;
            drawScene();
        }

        canvas.current!.addEventListener('mouseup', mouseUp);
        canvas.current!.addEventListener('mousedown', mouseDown);
        canvas.current!.addEventListener('mousemove', mouseMove);
        canvas.current!.addEventListener('wheel', mouseWheel);

        context.current = {
            gl,
            cube,
            program,
            modelView: new Matrix4().identity(),
            projection: new Matrix4().identity(),
            mousePos: new Vector2(),
            mousePressed: false,
            aspect: 1.0,
            zoom: 1.0,
            viewMode: 3,
            curSurface: 2,
            qNow: new Quaternion()
        }

        resizeCanvas(canvas.current!);
        resizeHandler();

        window.addEventListener('resize', () => {
            if (resizeCanvas(canvas.current!)) {
                resizeHandler();
            }
        });
    }

    React.useEffect(() => {
        init(); 
    }, [])

    return (
        <div className='relative bg-black h-[inherit] w-full'>
            <canvas ref={canvas} className='w-full h-[inherit]'></canvas>

            <Panel
                className='md:w-[60rem]'
            >
                <Label title='Shape'>
                    <MultiSwitch
                        onChange={(value) => {
                            context.current!.curSurface = value;
                            drawScene();
                            renderUI();
                        }}
                    >
                        <MultiSwitchElement label='Ellipsoid' value={2} />
                        <MultiSwitchElement label='Sphere' value={1} />
                        <MultiSwitchElement label='Torus' value={3} />
                        <MultiSwitchElement label='Rounded Box' value={4} />
                        <MultiSwitchElement label='Goursat' value={5} />
                    </MultiSwitch>
                </Label>
                <Label title='View Mode'>
                    <MultiSwitch
                        onChange={(value) => {
                            context.current!.viewMode = value;
                            drawScene();
                            renderUI();
                        }}
                    >
                        <MultiSwitchElement label='Stereo' value={3} />
                        <MultiSwitchElement label='Orthographic' value={1} />
                        <MultiSwitchElement label='Perspective' value={2} />
                    </MultiSwitch>
                </Label>
            </Panel>
        </div>
    )
}

export default App
