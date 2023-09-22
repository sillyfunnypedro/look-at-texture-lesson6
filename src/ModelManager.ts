/**
 * @module Models
 * @description Models for the application
 * 
 * 
 */
import GeometricProcessor from "./GeometricProcessor";
import FrameBuffer from "./FrameBuffer";
import { GL } from "./MinimalGL";
import Color from "./Color";


class ModelManager {

    /** 
     * A map of strings to functions that take a frame buffer and draw a model
     * 
     */
    modelTesters = new Map<string, (frame: FrameBuffer, drawBorder: boolean, borderColor: Color) => void>();



    constructor() {
        this.modelTesters.set("meshIndex", this.generateTrianglesIndex);
        this.modelTesters.set("meshTriangles", this.generateTriangles);
        this.modelTesters.set("triangleFan", this.generateTriangleFan);
        this.modelTesters.set("triangleStrip", this.renderTriangleStrip);


    }

    getModels(): string[] {
        return Array.from(this.modelTesters.keys());
    }

    getModel(model: string, width: number, height: number): number[] {
        switch (model) {
            case "triangleStrip":
                return this.generateTriangleStrip(width, height);
            default:
                return [];
        }

    }

    drawModel(model: string, frame: FrameBuffer, drawBorder: boolean, borderColor: Color): void {
        // const drawFunction = this.modelTesters.get(model);
        // if (drawFunction) {
        //     frame.clear(129, 128, 128);
        //     drawFunction(frame, drawBorder, borderColor);
        // }
        switch (model) {
            case "triangleStrip":
                this.renderTriangleStrip(frame, drawBorder, borderColor);
                break;
            case "triangleFan":
                this.generateTriangleFan(frame, drawBorder, borderColor);
                break;
            case "meshIndex":
                this.generateTrianglesIndex(frame, drawBorder, borderColor);
                break;
            case "meshTriangles":
                this.generateTriangles(frame, drawBorder, borderColor);
                break;
            default:
                break;
        }
    }

    /**
     * generateTriangleStrip
     * @param frame
     * @param drawBorder
     * @param borderColor
     * 
     * Draw a triangle strip to test the drawTriangleStrip function
     * The colors of the outside vertices alternate between color0, color1 and color2
     * The triangles make up a torus centered at the center of the frame buffer
     * The inner radius of the torus is defined by the variable innerRadius
     * The outer radius of the torus is defined by the variable outerRadius
     * see https://en.wikipedia.org/wiki/Triangle_strip
     */
    private generateTriangleStrip(width: number, height: number): number[] {
        const x = width / 2;
        const y = height / 2;

        const innerRadius = 40;
        const outerRadius = 80;

        let numSegments = 18; // each segment has two triangles
        const colors: Color[] = [
            new Color(255, 0, 0),
            new Color(0, 255, 0),
            new Color(0, 0, 255)
        ];


        const vertices: number[] = [];

        const angleStep = 2 * Math.PI / numSegments;




        for (let i = 0; i < numSegments; i++) {
            const currAngle = i * angleStep;
            const nextAngle = (i + 1) * angleStep;

            const x0 = x + innerRadius * Math.cos(currAngle);
            const y0 = y + innerRadius * Math.sin(currAngle);
            const x1 = x + outerRadius * Math.cos(currAngle);
            const y1 = y + outerRadius * Math.sin(currAngle);
            const x2 = x + innerRadius * Math.cos(nextAngle);
            const y2 = y + innerRadius * Math.sin(nextAngle);
            const x3 = x + outerRadius * Math.cos(nextAngle);
            const y3 = y + outerRadius * Math.sin(nextAngle);

            if (i == 0) {

                vertices.push(x0);
                vertices.push(y0);
                vertices.push(0);
                vertices.push(Math.floor(colors[i % 3].r));
                vertices.push(Math.floor(colors[i % 3].g));
                vertices.push(Math.floor(colors[i % 3].b));

                vertices.push(x1);
                vertices.push(y1);
                vertices.push(0);
                vertices.push(Math.floor(colors[(i + 2) % 3].r));
                vertices.push(Math.floor(colors[(i + 2) % 3].g));
                vertices.push(Math.floor(colors[(i + 2) % 3].b));
            }
            vertices.push(x2);
            vertices.push(y2);
            vertices.push(0);
            vertices.push(Math.floor(colors[(i + 1) % 3].r));
            vertices.push(Math.floor(colors[(i + 1) % 3].g));
            vertices.push(Math.floor(colors[(i + 1) % 3].b));

            vertices.push(x3);
            vertices.push(y3);
            vertices.push(0);
            vertices.push(Math.floor(colors[i % 3].r));
            vertices.push(Math.floor(colors[i % 3].g));
            vertices.push(Math.floor(colors[i % 3].b));

        }
        return vertices;


    }

    private renderTriangleStrip(frame: FrameBuffer, drawBorder: boolean, borderColor: Color): void {
        const vertices = this.generateTriangleStrip(frame.width, frame.height);
        GeometricProcessor.fillTriangleStrip(vertices, frame, drawBorder, borderColor);
    }






    /**
     * generateTriangleFan
     * @param frame
     * @param drawBorder 
     * @param borderColor 
     * 
     * Draw a triangle fan to test the drawTriangleFan function
     * The colors of the outside vertices alternate between color1 and color2
     */
    private generateTriangleFan(frame: FrameBuffer, drawBorder: boolean, borderColor: Color): void {
        const x = 10;
        const y = frame.height - 10;
        const r = 150;
        const numTriangles = 5;
        const color0 = new Color(255, 0, 0);
        const color1 = new Color(0, 255, 0);
        const color2 = new Color(0, 0, 255);


        const vertices: number[] = [];


        vertices.push(x);
        vertices.push(y);
        vertices.push(0);

        vertices.push(Math.floor(color0.r));
        vertices.push(Math.floor(color0.g));
        vertices.push(Math.floor(color0.b));

        for (let i = 0; i < numTriangles + 1; i++) {
            const s = i / numTriangles;
            const t = 0;
            let color = color1;
            if (i % 2 === 0) {
                color = color2;
            }
            const angle = -s * Math.PI / 2;
            const x1 = x + r * Math.cos(angle);
            const y1 = y + r * Math.sin(angle);
            vertices.push(x1);
            vertices.push(y1);
            vertices.push(0);
            vertices.push(Math.floor(color.r));
            vertices.push(Math.floor(color.g));
            vertices.push(Math.floor(color.b));
        }

        GeometricProcessor.fillTriangleFan(vertices, frame, drawBorder, borderColor);

    }





    /**
     * Draw a mesh to test the drawTriangles function
     * @param frame 
     */
    private generateTrianglesIndex(frame: FrameBuffer, drawBorder: boolean, borderColor: Color): void {
        // you can change the constants here to change the look of the mesh
        const x = 10;
        const y = 10;
        const w = 180;
        const h = 100;
        const x_steps = 10;
        const y_steps = 5;
        const x_step = w / x_steps;
        const y_step = h / y_steps;
        const color0 = new Color(255, 0, 0);
        const color1 = new Color(0, 255, 0);
        const color2 = new Color(0, 0, 255);
        const color3 = new Color(255, 255, 0);

        const vertices: number[] = [];
        let num_vertices = 0;
        for (let i = 0; i < x_steps + 1; i++) {
            for (let j = 0; j < y_steps + 1; j++) {
                const s = i / x_steps;
                const t = j / y_steps;
                const color = Color.interpolate2d(color0, color1, color2, color3, s, t);
                vertices.push(x + i * x_step);
                vertices.push(y + j * y_step);
                vertices.push(0);
                vertices.push(Math.floor(color.r));
                vertices.push(Math.floor(color.g));
                vertices.push(Math.floor(color.b));
                num_vertices += 1;
            }
        }

        const indices: number[] = [];
        let numTriangles = 0;

        for (let i = 0; i < x_steps; i++) {
            for (let j = 0; j < y_steps; j++) {
                indices.push(i * (y_steps + 1) + j);
                indices.push(i * (y_steps + 1) + j + 1);
                indices.push((i + 1) * (y_steps + 1) + j);
                indices.push(i * (y_steps + 1) + j + 1);
                indices.push((i + 1) * (y_steps + 1) + j + 1);
                indices.push((i + 1) * (y_steps + 1) + j);
                numTriangles += 2;
            }
        }

        GeometricProcessor.fillTrianglesIndex(vertices, indices, numTriangles, frame, drawBorder, borderColor);
    }

    /**
     * Draw a mesh to test the drawTriangles function
     * @param frame 
     */
    private generateTriangles(frame: FrameBuffer, drawBorder: boolean, borderColor: Color): void {
        // you can change the constants here to change the look of the mesh
        const x = 10;
        const y = 10;
        const w = 180;
        const h = 100;
        const x_steps = 1;
        const y_steps = 1;
        const x_step = w / x_steps;
        const y_step = h / y_steps;
        const color0 = new Color(255, 0, 0);
        const color1 = new Color(0, 255, 0);
        const color2 = new Color(0, 0, 255);
        const color3 = new Color(255, 255, 0);

        const tmpVertices: number[] = [];
        let num_vertices = 0;
        let vertices: number[] = [];
        for (let i = 0; i < x_steps + 1; i++) {
            for (let j = 0; j < y_steps + 1; j++) {
                const s = i / x_steps;
                const t = j / y_steps;
                const color = Color.interpolate2d(color0, color1, color2, color3, s, t);
                tmpVertices.push(x + i * x_step);
                tmpVertices.push(y + j * y_step);
                tmpVertices.push(0);
                tmpVertices.push(Math.floor(color.r));
                tmpVertices.push(Math.floor(color.g));
                tmpVertices.push(Math.floor(color.b));
                num_vertices += 1;
            }
        }

        const indices: number[] = [];
        let numTriangles = 0;


        // use the same scheme to generate the triangles as in the generateTrianglesIndex function

        function pushVertex(index: number) {
            index *= 6;
            vertices.push(tmpVertices[index]);  // x
            vertices.push(tmpVertices[index + 1]); //y
            vertices.push(tmpVertices[index + 2]); //z
            vertices.push(tmpVertices[index + 3]); //r
            vertices.push(tmpVertices[index + 4]); //g
            vertices.push(tmpVertices[index + 5]); //b
        }

        for (let i = 0; i < x_steps; i++) {
            for (let j = 0; j < y_steps; j++) {
                // Need to generate two triangles here
                // Triangle 1
                //indices.push(i * (y_steps + 1) + j);
                let vertexIndex = i * (y_steps + 1) + j;
                pushVertex(vertexIndex);

                //indices.push(i * (y_steps + 1) + j + 1);
                vertexIndex = i * (y_steps + 1) + j + 1;
                pushVertex(vertexIndex);


                //indices.push((i + 1) * (y_steps + 1) + j);
                vertexIndex = (i + 1) * (y_steps + 1) + j;
                pushVertex(vertexIndex);

                //indices.push(i * (y_steps + 1) + j + 1);
                vertexIndex = i * (y_steps + 1) + j + 1;
                pushVertex(vertexIndex);

                //indices.push((i + 1) * (y_steps + 1) + j + 1);
                vertexIndex = (i + 1) * (y_steps + 1) + j + 1;
                pushVertex(vertexIndex);

                //indices.push((i + 1) * (y_steps + 1) + j);
                vertexIndex = (i + 1) * (y_steps + 1) + j;
                pushVertex(vertexIndex);

                numTriangles += 2;
            }
        }

        GeometricProcessor.fillTriangles(vertices, numTriangles, frame, drawBorder, borderColor);
    }
}





export default ModelManager;
