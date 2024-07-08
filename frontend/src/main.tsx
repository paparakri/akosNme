import ReactDOM from 'react-dom/client'
import { ChakraProvider } from '@chakra-ui/react'
import CallToActionWithIllustration from './homepage'
import SignupCard from './auth/singUp'
import SimpleCard from './auth/signIn'
import FilterWindow from './components/filterWindow'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ChakraProvider>
      <FilterWindow/>
  </ChakraProvider>,
);