import TuneIcon from '@mui/icons-material/Tune';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    useDisclosure,
    Button,
    Icon,
    Divider
  } from '@chakra-ui/react'
import FilterWindow from './filterWindow.tsx';
import { SmallCloseIcon } from '@chakra-ui/icons';

function Filter() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    return (
        <>
          <Button onClick={onOpen}>
            <Icon as={TuneIcon}/>
          </Button>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Modal Title</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FilterWindow />
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={onClose}>
                  Filter
                </Button>
                <Button variant='ghost'>{'Clear \t'}<Divider/> <SmallCloseIcon/></Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}

export default Filter;