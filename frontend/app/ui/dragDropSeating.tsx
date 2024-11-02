import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Transformer } from 'react-konva';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  useColorModeValue,
  Heading,
  Input,
  FormControl,
  FormLabel,
  Select,
  useToast,
  IconButton,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import useImage from 'use-image';
import { Save, Plus, Undo, Redo, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { fetchClubInfo, saveDataLayout } from '../lib/backendAPI';

type Table = {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  type: string;
  people: number;
  isReserved: boolean;
}

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

const TableImage: React.FC<TableImageProps> = ({
  isSelected,
  onSelect,
  onChange,
  x,
  y,
  width,
  height,
}) => {
  const imageRef = useRef(null);
  const trRef = useRef(null);
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
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(50, node.width() * scaleX),
              height: Math.max(50, node.height() * scaleY),
            });
          }
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            return newBox.width < 50 || newBox.height < 50 ? oldBox : newBox;
          }}
          anchorFill="#F6AD55"
          anchorStroke="#C05621"
          anchorSize={8}
          anchorCornerRadius={2}
        />
      )}
    </>
  );
};

interface EditTableInfoProps {
  table: Table;
  onSave: (updates: Partial<Table>) => void;
}

const EditTableInfo: React.FC<EditTableInfoProps> = ({ table, onSave }) => {
  const handleChange = (field: keyof Table, value: any) => {
    onSave({ [field]: value });
  };

  return (
    <Card>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Table Name</FormLabel>
            <Input
              value={table.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Table Type</FormLabel>
            <Select
              value={table.type}
              onChange={(e) => handleChange('type', e.target.value)}
            >
              <option value="Normal">Normal</option>
              <option value="VIP">VIP</option>
              <option value="Booth">Booth</option>
              <option value="Bar">Bar</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Max People</FormLabel>
            <Input
              type="number"
              value={table.people}
              onChange={(e) => handleChange('people', parseInt(e.target.value))}
              min={1}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Status</FormLabel>
            <Select
              value={table.isReserved ? 'reserved' : 'available'}
              onChange={(e) => handleChange('isReserved', e.target.value === 'reserved')}
            >
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
            </Select>
          </FormControl>

          <HStack spacing={2} mt={2}>
            <Badge colorScheme={table.isReserved ? 'red' : 'green'}>
              {table.isReserved ? 'Reserved' : 'Available'}
            </Badge>
            <Badge colorScheme="purple">{table.type}</Badge>
            <Badge colorScheme="blue">{table.people} People</Badge>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export const DragDropSeatingCanvas: React.FC<{id: string}> = ({id}) => {
  const [tableList, setTableList] = useState<TableList>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [history, setHistory] = useState<TableList[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Initial load of table layout
  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const data = await fetchClubInfo(id);
        if (data?.tableLayout?.[0]?.tableLayout?.tables) {
          setTableList(data.tableLayout[0].tableLayout.tables);
          setHistory([data.tableLayout[0].tableLayout.tables]);
        }
      } catch (error) {
        console.error('Error loading layout:', error);
        toast({
          title: 'Error loading layout',
          status: 'error',
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLayout();
  }, [id]);

  const saveLayout = async () => {
    try {
      const layout = {
        name: "main layout",
        tables: tableList
      };
      await saveDataLayout(id, layout);
      toast({
        title: "Layout saved successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error saving layout",
        status: "error",
        duration: 3000,
      });
    }
  };

  const addTable = () => {
    const newTable: Table = {
      x: 50,
      y: 50,
      width: 100,
      height: 100,
      name: `Table ${tableList.length + 1}`,
      type: "Normal",
      people: 4,
      isReserved: false
    };
    
    const newTableList = [...tableList, newTable];
    setTableList(newTableList);
    updateHistory(newTableList);
  };

  const updateTable = (index: number, newProps: Partial<Table>) => {
    const newTableList = tableList.map((table, i) =>
      i === index ? { ...table, ...newProps } : table
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
    if (historyStep > 0) {
      setHistoryStep(prevStep => prevStep - 1);
      setTableList(history[historyStep - 1]);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(prevStep => prevStep + 1);
      setTableList(history[historyStep + 1]);
    }
  };

  const deleteSelectedTable = () => {
    if (selectedId !== null) {
      const newTableList = tableList.filter((_, index) => index !== selectedId);
      setTableList(newTableList);
      updateHistory(newTableList);
      setSelectedId(null);
    }
  };

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box maxW="8xl" mx="auto" pt={5} px={{ base: 2, sm: 12, md: 17 }}>
      <Heading as="h1" size="xl" mb={6} color="orange.400">
        Table Layout Manager
      </Heading>
      
      <HStack spacing={8} align="start">
        <VStack spacing={4} align="stretch" flex={2}>
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            borderRadius="lg"
            boxShadow="xl"
            overflow="hidden"
            height="600px"
            position="relative"
          >
            <Stage
              width={800}
              height={600}
              onClick={(e) => {
                if (e.target === e.target.getStage()) {
                  setSelectedId(null);
                }
              }}
            >
              <Layer>
                {tableList.map((table, index) => (
                  <TableImage
                    key={index}
                    isSelected={index === selectedId}
                    onSelect={() => setSelectedId(index)}
                    onChange={(newProps) => updateTable(index, newProps)}
                    {...table}
                  />
                ))}
              </Layer>
            </Stage>
          </Box>

          <HStack spacing={4}>
            <Button
              leftIcon={<Plus />}
              onClick={addTable}
              colorScheme="orange"
            >
              Add Table
            </Button>
            <Button
              leftIcon={<Undo />}
              onClick={handleUndo}
              isDisabled={historyStep === 0}
            >
              Undo
            </Button>
            <Button
              leftIcon={<Redo />}
              onClick={handleRedo}
              isDisabled={historyStep === history.length - 1}
            >
              Redo
            </Button>
            <Button
              leftIcon={<Trash2 />}
              onClick={deleteSelectedTable}
              isDisabled={selectedId === null}
              colorScheme="red"
            >
              Delete Selected
            </Button>
            <Button
              leftIcon={<Save />}
              onClick={saveLayout}
              colorScheme="green"
            >
              Save Layout
            </Button>
          </HStack>
        </VStack>

        <Box flex={1}>
          {selectedId !== null ? (
            <EditTableInfo
              table={tableList[selectedId]}
              onSave={(updates) => updateTable(selectedId, updates)}
            />
          ) : (
            <Card>
              <CardBody>
                <Text color="gray.500">
                  Select a table to edit its properties
                </Text>
              </CardBody>
            </Card>
          )}
        </Box>
      </HStack>
    </Box>
  );
};

export default DragDropSeatingCanvas;