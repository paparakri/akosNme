import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import SelectLocation from "./components/filtering/selectLocation.tsx";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider>
      <SelectLocation/>
  </ChakraProvider>,
);