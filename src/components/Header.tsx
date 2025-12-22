import { Box, Heading, Text } from '@chakra-ui/react'

const version = '1.0.0'

const Header = () => (
  <Box position="fixed" top={0} left={0} right={0} zIndex={1000}>
    <Box as="header" py={4} bg="blue.100" width="100%" height={"55px"} color="gray.800" p={4}>
      <Box display="flex" alignItems="center" justifyContent="space-between" height="100%">
        <Text fontSize="sm" color="gray.600" fontWeight="medium">v{version}</Text>
        <Heading size="lg" display="flex" alignItems="center" height="100%" flex={1} justifyContent="center">Clash Royale ダメージ計算</Heading>
        <Box width="60px" />
      </Box>
    </Box>
  </Box>
)
export default Header
