import React, { useEffect, useRef, useState } from 'react';
import { Image, Layer, Stage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Button, useToast } from '@chakra-ui/react';
import Konva from 'konva';
import { saveDataLayout } from '../lib/backendAPI';

type Table = [number, number, string, number, number];
type TableList = Table[];

interface TableImageProps {
    isSelected: boolean;
    onSelect: () => void;
    onChange: (newProps: { x: number; y: number; width: number; height: number }) => void;
    x: number;
    y: number;
    width: number;
    height: number;
}

const TableImage: React.FC<TableImageProps> = ({ isSelected, onSelect, onChange, x, y, width, height }) => {
    const imageRef = useRef<Konva.Image>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const [image] = useImage('/table1.png');
  
    useEffect(() => {
      if (isSelected && trRef.current && imageRef.current) {
        trRef.current.nodes([imageRef.current]);
        trRef.current.getLayer()?.batchDraw();
      }
    }, [isSelected]);
  
    return (
      <>
        <Image
          image={image}
          onClick={onSelect}
          onTap={onSelect}
          ref={imageRef}
          width={width}
          height={height}
          x={x}
          y={y}
          draggable
          onDragEnd={(e) => {
            onChange({
              x: e.target.x(),
              y: e.target.y(),
              width,
              height
            });
          }}
          onTransformEnd={() => {
            const node = imageRef.current;
            if (node) {
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();
              
              // Reset scale to 1 to avoid compounding scales
              node.scaleX(1);
              node.scaleY(1);
              
              onChange({
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(5, node.height() * scaleY),
              });
            }
          }}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </>
    );
  };

export const DragDropSeatingCanvas: React.FC<{id: string}> = ({id}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [image] = useImage('/table1.png');
    const [tableList, setTableList] = useState<TableList>([[50, 50, "Normal", 100, 100]]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [history, setHistory] = useState<TableList[]>([[[50, 50, "Normal", 100, 100]]]);
    const [historyStep, setHistoryStep] = useState(0);
    const toast = useToast();

    const saveLayout = (tables: TableList) => {
        console.log("inside save button");
        const tableData = tables.map(table => ({
            x: table[0],
            y: table[1],
            type: table[2],
            width: table[3],
            height: table[4]
        }));

        const layout = {
            name: "main layout",
            tables: tableData
        }

        saveDataLayout(id, layout);
        console.log("Layout Saved");
        
        toast({
            title: "Layout Saved.",
            description: "Your layout has been successfully saved.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    }

    const addTable = () => {
        const newTableList = [
            ...tableList,
            [Math.random() * 400, Math.random() * 300, "Normal", 100, 100] as Table
        ];
        setTableList(newTableList);
        updateHistory(newTableList);
    }

    const updateTable = (index: number, newProps: { x: number; y: number; width: number; height: number }) => {
        const newTableList = tableList.map((table, i) => 
            i === index ? [newProps.x, newProps.y, table[2], newProps.width, newProps.height] as Table : table
        );
        setTableList(newTableList);
        updateHistory(newTableList);
    };

    const updateHistory = (newTableList: TableList) => {
        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(newTableList);
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (historyStep === 0) return;
        setHistoryStep(prevStep => prevStep - 1);
        setTableList(history[historyStep - 1]);
    };

    const handleRedo = () => {
        if (historyStep === history.length - 1) return;
        setHistoryStep(prevStep => prevStep + 1);
        setTableList(history[historyStep + 1]);
    };

    const deleteSelectedTable = () => {
        if (selectedId === null) return;
        const newTableList = tableList.filter((_, index) => index !== selectedId);
        setTableList(newTableList);
        updateHistory(newTableList);
        setSelectedId(null);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <div style={{ border: '2px solid black', display: 'inline-block', background: "#e1e0dd"}}>
                <Stage width={window.innerWidth/2} height={window.innerHeight/2} >
                    <Layer>
                        {tableList.map((table, index) => (
                            <TableImage
                                key={index}
                                isSelected={index === selectedId}
                                onSelect={() => setSelectedId(index)}
                                onChange={(newProps) => updateTable(index, newProps)}
                                x={table[0]}
                                y={table[1]}
                                width={table[3]}
                                height={table[4]}
                            />
                        ))}
                    </Layer>
                </Stage>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Button
                    m={2}
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'orange.400'}
                    onClick={addTable}
                    _hover={{
                        bg: 'orange.300',
                    }}
                >
                    Add Table
                </Button>
                <Button
                    m={2}
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'orange.400'}
                    onClick={handleUndo}
                    _hover={{
                        bg: 'orange.300',
                    }}
                >
                    Undo
                </Button>
                <Button
                    m={2}
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'orange.400'}
                    onClick={handleRedo}
                    _hover={{
                        bg: 'orange.300',
                    }}
                >
                    Redo
                </Button>
                <Button
                    m={2}
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'orange.400'}
                    onClick={deleteSelectedTable}
                    _hover={{
                        bg: 'orange.300',
                    }}
                    isDisabled={selectedId === null}
                >
                    Delete Selected Table
                </Button>
                <Button
                    m={2}
                    display={{ base: 'none', md: 'inline-flex' }}
                    fontSize={'sm'}
                    fontWeight={600}
                    color={'white'}
                    bg={'orange.400'}
                    onClick={() => saveLayout(tableList)}
                    _hover={{
                        bg: 'orange.300',
                    }}
                >
                    Save Layout
                </Button>
            </div>
        </div>
    );
}