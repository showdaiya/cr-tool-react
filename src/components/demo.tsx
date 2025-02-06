'use client';

import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Stack,
  VStack,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';

// importに追加
import { AttackCard } from './AttackCard';

import testData from '../../data/test_data.json';
import { StatusIndicator } from './StatusIndicator';
export default function CardBattle() {
  // データインポート

  const characters = testData.array;
  console.log(characters);

  return (
    <Box width="100%" minHeight="100vh" display="flex" justifyContent="center">
      <Box width="100%" maxW="1400px" py={8}>
        <VStack spacing={8} w="full">
          {/* Receiving Card Section */}
          <Stack w="full" spacing={3}>
            <Flex justify="space-between" align="center" px={8}>
              <Heading size="md">攻撃を受ける側のカード</Heading>
              <Button colorScheme="blue" size="sm">
                選択
              </Button>
            </Flex>
            <Card borderWidth="2px" borderColor="blue.100" mx={8} p={1}>
              <CardBody>
                <Flex justify="flex-start" fontSize="sm" align="center">
                  <img
                    src="/resized_cards/card_001_Knight.png"
                    alt="ナイトの画像"
                  />
                  <VStack spacing={2} align="left" ml={4}>
                    <StatusIndicator label="HP" value={100} />
                    <StatusIndicator label="被ダメージ合計" value={100} />
                    <StatusIndicator label="残りHP" value={0} />
                  </VStack>
                </Flex>
              </CardBody>
            </Card>
          </Stack>

          {/* Attacking Cards Section */}
          <Stack w="full" spacing={3}>
            <Flex justify="space-between" align="center" px={8}>
              <Heading size="md">攻撃をするカード</Heading>
              <Button colorScheme="red" size="sm">
                追加
              </Button>
            </Flex>
            <VStack spacing={3} w="full" px={8}>
              {[1, 2, 3].map(num => (
                <AttackCard key={num} damage={81} attackNum={3} imgSrc={`/resized_cards/card_001_Knight.png`} imgAlt="ナイトの画像" />
              ))}
              <Button
                variant="outline"
                w="full"
                h="12"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="red.200"
                _hover={{ borderColor: 'red.400', bg: 'red.50' }}
                _focus={{ outline: 'none' }}
              >
                <AddIcon color="red.500" />
              </Button>
            </VStack>
          </Stack>
        </VStack>
      </Box>
    </Box>
  );
}
