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
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { TransactionLink } from '../../components/transaction-link';
import { createTransferMsg, useSdk } from '../../services';
import { waitingTx } from '../../services';

export const Transfer = () => {
  const toast = useToast();
  const { address, getSignerClient, config, refreshBalance } = useSdk();

  const [loading, setLoading] = useBoolean();
  const [recipient, setRecipient] = useState<string>();
  const [amount, setAmount] = useState<number>(0);

  const submit = async () => {
    if (!address || !recipient || !amount) {
      return;
    }
    const gno = getSignerClient();
    if (!gno) {
      return;
    }

    setLoading.on();

    try {
      const toSend = `${Math.ceil(amount * 10**6)}${config.token.coinMinimalDenom}`;
      const msg = createTransferMsg(address, recipient, toSend);
      const response = await gno.signAndBroadcast(address, [msg]);
      const query =`tx.hash='${response.txhash}'`;
      waitingTx("wss://rpc.gno.tools", query)
      .then(async (tx) => {
        await refreshBalance();
        toast({
          title: `Transaction Successful`,
          description: <TransactionLink tx={response.txhash} />,
          status: "success",
          position: "bottom-right",
          isClosable: true,
        });
        setLoading.off();
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `${error}`,
        status: "error",
        position: "bottom-right",
        isClosable: true,
      });
      console.log(error);
      setLoading.off();
    }
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
                disabled={!address}
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
