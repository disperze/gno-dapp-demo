import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Button,
    Heading,
    useColorModeValue,
    NumberInput,
    NumberInputField,
    useBoolean,
} from '@chakra-ui/react';
import { useState } from 'react';

export const Transfer = () => {
    const [loading, setLoading] = useBoolean();
    const [recipient, setRecipient] = useState<string>();
    const [amount, setAmount] = useState<number>(0);

    const submit = () => {
        setLoading.on();
        
        console.log(recipient, amount);
    };

  return (
    <Flex
      align={'center'}
      justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Transfer
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          w={"420px"}
          px={10}
          py={16}>
          <Stack spacing={4}>
            <FormControl id="address">
              <FormLabel>Recipient</FormLabel>
              <Input 
                placeholder="g1us8428u2a5satrlxzagqqa5m6vmuze025anjlj" 
                onChange={(e) => setRecipient(e.target.value)}
              />
            </FormControl>
            <FormControl id="amount">
              <FormLabel>Amount (GNOT)</FormLabel>
              <NumberInput
                onChange={(_, value) => setAmount(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                onClick={submit}
                isLoading={loading}
                loadingText="Sending"
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}>
               Transfer
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};