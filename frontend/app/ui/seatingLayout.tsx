import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import useImage from 'use-image';

type Table = { width: number; height: number; x: number; y: number; };
type TableList = Table[];

interface LayoutDisplayProps {
    tableList: TableList;
    containerWidth: number;
    containerHeight: number;
}

const LayoutDisplay: React.FC<LayoutDisplayProps> = ({ tableList, containerWidth, containerHeight }) => {
    const [image] = useImage('/table1.png');
    const [scale, setScale] = useState(1);

    useEffect(() => {
        // Find the maximum x and y coordinates of tables
        const maxX = Math.max(...tableList.map(table => table.x + table.width));
        const maxY = Math.max(...tableList.map(table => table.y + table.height));

        // Calculate scale to fit the layout within the container
        const scaleX = containerWidth / maxX;
        const scaleY = containerHeight / maxY;
        const newScale = Math.min(scaleX, scaleY, 1); // Ensure we don't scale up

        setScale(newScale);
    }, [tableList, containerWidth, containerHeight]);

    return (
        <Stage width={containerWidth} height={containerHeight}>
            <Layer>
                {tableList.map((table, index) => (
                    <Image
                        key={index}
                        image={image}
                        x={table.x * scale}
                        y={table.y * scale}
                        width={table.width * scale}
                        height={table.height * scale}
                    />
                ))}
            </Layer>
        </Stage>
    );
};

export default LayoutDisplay;