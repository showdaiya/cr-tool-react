import { AddIcon } from '@chakra-ui/icons';
import { Button, VStack, Heading, Flex, Stack, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Input, FormControl, FormLabel } from '@chakra-ui/react';
import { GradientButton } from './common/GradientButton';
import { AttackCard } from './AttackCard';
import { useAttackCards } from '../contexts/CardContext';
import { useAttackLastIndex } from '../contexts/CardContext';
import { useState } from 'react';

export const AttackCardSection = () => {
  const [attackCards, setAttackCards] = useAttackCards();
  const [attackLastIndex, setAttackLastIndex] = useAttackLastIndex();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bulkAddCount, setBulkAddCount] = useState('5');

  const handleAddClick = () => {
    const newIndex = attackLastIndex + 1;
    setAttackLastIndex(newIndex);
    setAttackCards({ ...attackCards, [newIndex]: { CardKey: null, AttackNumber: 1, Type: null } });
  };

  const handleBulkAdd = () => {
    const count = parseInt(bulkAddCount) || 1;
    const newCards = { ...attackCards };
    let newLastIndex = attackLastIndex;
    
    for (let i = 0; i < count; i++) {
      newLastIndex += 1;
      newCards[newLastIndex] = { CardKey: null, AttackNumber: 1, Type: null };
    }
    
    setAttackCards(newCards);
    setAttackLastIndex(newLastIndex);
    onClose();
  };

  return (
    <Stack w="full" spacing={3}>
      <Flex justify="space-between" align="center" height={10}>
        <Heading size="md">攻撃側</Heading>
        <GradientButton topColor="green.400" bottomColor="green.500" onClick={onOpen}>
          一括追加
        </GradientButton>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>カードを一括追加</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>追加するカード枚数</FormLabel>
              <Input
                type="number"
                min="1"
                max="20"
                value={bulkAddCount}
                onChange={(e) => setBulkAddCount(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              キャンセル
            </Button>
            <Button colorScheme="blue" onClick={handleBulkAdd}>
              追加
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <VStack spacing={3} w="full">
        {Object.keys(attackCards).map(key => (
          <AttackCard key={Number(key)} attackCardIndex={Number(key)} />
        ))}
        <Button
          variant="outline"
          w="full"
          h="12"
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="red.200"
          _focus={{ outline: 'none' }}
          _hover={{}}
          _active={{}}
          onClick={handleAddClick}
        >
          <AddIcon color="red.500" />
        </Button>
      </VStack>
    </Stack>
  );
};
