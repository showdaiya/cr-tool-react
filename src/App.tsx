//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
//import './App.css'
import { Box } from '@chakra-ui/react';
import CardBattle from './components/demo';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/chakraTheme';

function App() {
  return (
    <ChakraProvider theme={theme}>
      <Box
        width={'100vw'}
        minHeight={'100vh'}
        mx="auto"
        display="flex"
        alignItems="flex-start"
        justifyContent="center"
        overflow="auto"
      >
        <CardBattle />
      </Box>
    </ChakraProvider>
  );
}
export default App;
