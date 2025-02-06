import { Card, CardBody, Flex, VStack } from '@chakra-ui/react';
import { StatusIndicator } from './StatusIndicator';

interface AttackCardProps {
  damage: number;
  attackNum: number;
  imgSrc: string;
  imgAlt: string;
}

export const AttackCard = ({ damage, attackNum, imgSrc, imgAlt }: AttackCardProps) => {
  const totalDamage: number = damage * attackNum;

  return (
    <Card
      w="full"
      cursor="pointer"
      borderWidth="1px"
      borderColor={'gray.400'}
      boxShadow={'md'}
      _hover={{ bg: 'red.50', borderColor: 'red.200' }}
      p={'1px'}
    >
      <CardBody>
        <Flex justify="flex-start" fontSize="sm" align="center">
          <img src={imgSrc} alt={imgAlt} />
          <VStack spacing={2} align="left" ml={4}>
            <StatusIndicator label="ダメージ" value={damage} color="red.500" />
            <StatusIndicator label="攻撃回数" value={attackNum} color="red.500" />
            <StatusIndicator label="総ダメージ数" value={totalDamage} color="red.500" />
          </VStack>
        </Flex>
      </CardBody>
    </Card>
  );
};
