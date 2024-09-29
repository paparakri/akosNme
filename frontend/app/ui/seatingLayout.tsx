import React, { useEffect, useRef } from 'react';
import useImage from 'use-image';

type Table = { width: number; height: number; x: number; y: number; };
type TableList = Table[];

interface LayoutDisplayProps {
    tableList: TableList;
}

const LayoutDisplay: React.FC<LayoutDisplayProps> = ({ tableList }) => {
    const [image] = useImage('/table1.png');
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && image) {
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
                tableList.forEach((table) => {
                    context.drawImage(image, table.x, table.y, table.width, table.height);
                });
            }
        }
    }, [image, tableList]);

    return (
        <div style={{ border: '2px solid black', display: 'inline-block', background: "#e1e0dd" }}>
            <canvas ref={canvasRef} width={700} height={500} />
        </div>
    );
};

export default LayoutDisplay;