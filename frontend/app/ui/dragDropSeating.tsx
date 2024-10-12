import React, { useEffect, useRef, useState } from 'react';
import { Image, Layer, Stage, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Button, Text, Flex, useToast, VStack, Heading, FormControl, FormLabel, Input, Textarea, NumberInput, NumberInputField, HStack, Box, Select, Divider, useColorModeValue, Badge, SimpleGrid } from '@chakra-ui/react';
import Konva from 'konva';
import { fetchClubInfo, saveDataLayout } from '../lib/backendAPI';
import { AddIcon, CheckIcon, CloseIcon, DeleteIcon, EditIcon, RepeatIcon, StarIcon } from '@chakra-ui/icons';
import { SaveIcon } from 'lucide-react';

type Table = {
    x: number,
    y: number,
    width: number,
    height: number,
    name: string,
    type: string,
    people: number,
    isReserved: boolean
}
type TableList = Table[];

interface StyledKonvaCanvasProps {
    tableList: Table[];
    selectedId: number | null;
    setSelectedId: (id: number) => void;
    updateTable: (index: number, newProps: Partial<Table>) => void;
  }

interface TableImageProps {
    isSelected: boolean;
    name: string,
    type: string,
    people: number,
    isReserved: boolean,
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

  interface EditTableInfoProps {
    table: Table;
    onSave: (updatedTable: Table) => void;
  }
  
  const EditTableInfo: React.FC<EditTableInfoProps> = ({ table, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tableData, setTableData] = useState<Table>(table);
  
    useEffect(() => {
      setTableData(table);
    }, [table]);
  
    const handleSave = () => {
      onSave(tableData);
      setIsEditing(false);
    };
  
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setTableData(prev => ({
        ...prev,
        [name]: name === 'people' ? parseInt(value) : name === 'isReserved' ? value === 'yes' : value
      }));
    };
  
    const bgColor = useColorModeValue('white', 'gray.700');
    const borderColor = useColorModeValue('gray.200', 'gray.600');
  
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="md"
        width="100%"
      >
        <VStack align="stretch" spacing={4}>
          <Heading size="md" color="orange.400">Table Information</Heading>
          <Divider />
          {isEditing ? (
            <>
              <FormControl>
                <FormLabel>Table Name</FormLabel>
                <Input name="name" value={tableData.name} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Table Type</FormLabel>
                <Input name="type" value={tableData.type} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Max. People</FormLabel>
                <Input name="people" type="number" value={tableData.people} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Reserved</FormLabel>
                <Select name="isReserved" value={tableData.isReserved ? 'yes' : 'no'} onChange={handleInputChange}>
                  <option value='yes'>Yes</option>
                  <option value='no'>No</option>
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <Flex justify="space-between">
                <Text fontWeight="bold">Table Name:</Text>
                <Text>{tableData.name}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="bold">Table Type:</Text>
                <Text>{tableData.type}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="bold">Max. People:</Text>
                <Text>{tableData.people} people</Text>
              </Flex>
              <Flex justify="space-between">
                <Text fontWeight="bold">Reserved:</Text>
                <Badge colorScheme={tableData.isReserved ? 'red' : 'green'}>
                  {tableData.isReserved ? 'Yes' : 'No'}
                </Badge>
              </Flex>
            </>
          )}
          <Divider />
          <Flex justify="flex-end" gap={4}>
            {isEditing ? (
              <>
                <Button leftIcon={<CloseIcon />} onClick={() => setIsEditing(false)} variant="outline">
                  Cancel
                </Button>
                <Button leftIcon={<CheckIcon />} onClick={handleSave} colorScheme="orange">
                  Save Changes
                </Button>
              </>
            ) : (
              <Button leftIcon={<EditIcon />} onClick={() => setIsEditing(true)} colorScheme="orange">
                Edit Table
              </Button>
            )}
          </Flex>
        </VStack>
      </Box>
    );
  };
  
  const StyledKonvaCanvas: React.FC<StyledKonvaCanvasProps> = ({
    tableList,
    selectedId,
    setSelectedId,
    updateTable
  }) => {
    const bgColor = useColorModeValue('gray.100', 'gray.700');
    const borderColor = useColorModeValue('gray.300', 'gray.600');
  
    return (
      <Box
        borderWidth="2px"
        borderStyle="solid"
        borderColor={borderColor}
        borderRadius="lg"
        overflow="hidden"
        bg={bgColor}
        boxShadow="lg"
        width="100%"
        height="600px"
      >
        <Stage width={800} height={600}>
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
    );
  };
  
  export const DragDropSeatingCanvas: React.FC<{id: string}> = ({id}) => {
    const [tableList, setTableList] = useState<TableList>([{x:50, y:50, width:100, height:100, name:"Table 1", type:"Normal", people:10, isReserved:false}]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [history, setHistory] = useState<TableList[]>([]);
    const [historyStep, setHistoryStep] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();
  
    useEffect(() => {
      fetchClubInfo(id).then(data => {
        console.log("Printing data.tableLayout[0]: "); console.log(data.tableLayout[0].tableLayout.tables);
        setTableList(data.tableLayout[0].tableLayout.tables);
        setIsLoading(true);
      });
    }, []);

    const saveLayout = (tables: TableList) => {
      const layout = {
        name: "main layout",
        tables: tables
      };
      saveDataLayout(id, layout);
      toast({
        title: "Layout Saved.",
        description: "Your layout has been successfully saved.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    };
  
    const addTable = () => {
      const newTableList = [
        ...tableList,
        {x:Math.random() * 400, y:Math.random() * 300, width:100, height:100, name:`Table ${tableList.length + 1}`, type:"Normal", people:10, isReserved:false} as Table
      ];
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
  
    return (
      <Box maxW="7xl" mx={'auto'} pt={5} px={{ base: 2, sm: 12, md: 17 }}>
        <Heading as="h1" size="xl" mb={6} color="orange.400">
          Table Layout Manager
        </Heading>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
          <VStack spacing={4} align="stretch">
            {tableList && (
              <StyledKonvaCanvas
                tableList={tableList}
                selectedId={selectedId}
                setSelectedId={setSelectedId}
                updateTable={updateTable}
              />
            )}
            <Flex justify="space-between" wrap="wrap" gap={2}>
              <Button
                leftIcon={<AddIcon />}
                onClick={addTable}
                colorScheme="orange"
                size="sm"
              >
                Add Table
              </Button>
              <Button
                leftIcon={<RepeatIcon />}
                onClick={handleUndo}
                isDisabled={historyStep === 0}
                colorScheme="blue"
                size="sm"
              >
                Undo
              </Button>
              <Button
                leftIcon={<RepeatIcon />}
                onClick={handleRedo}
                isDisabled={historyStep === history.length - 1}
                colorScheme="blue"
                size="sm"
              >
                Redo
              </Button>
              <Button
                leftIcon={<DeleteIcon />}
                onClick={deleteSelectedTable}
                isDisabled={selectedId === null}
                colorScheme="red"
                size="sm"
              >
                Delete Selected
              </Button>
              <Button
                leftIcon={<SaveIcon />}
                onClick={() => saveLayout(tableList)}
                colorScheme="green"
                size="sm"
              >
                Save Layout
              </Button>
            </Flex>
          </VStack>
          <Box>
            {selectedId !== null ? (
              <EditTableInfo
                table={tableList[selectedId]}
                onSave={(updatedTable) => updateTable(selectedId, updatedTable)}
              />
            ) : (
              <Box
                borderWidth="1px"
                borderRadius="lg"
                p={6}
                bg={useColorModeValue('white', 'gray.700')}
                borderColor={useColorModeValue('gray.200', 'gray.600')}
                boxShadow="md"
              >
                <Text>No table selected. Click on a table to edit its details.</Text>
              </Box>
            )}
          </Box>
        </SimpleGrid>
      </Box>
    );
  };