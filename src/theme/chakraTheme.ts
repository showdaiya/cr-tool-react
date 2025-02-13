import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        _focus: {
          outline: 'none',
        },
      },
    },
  },
});

export default theme;
