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
import { StdSignDoc } from "@cosmjs/amino";
import { useSdk } from '../../services';
import { BaseAccount, makeProtoTx } from '../../services';

export const Transfer = () => {
    const { address, client, getSigner, config, refreshBalance } = useSdk();

    const [loading, setLoading] = useBoolean();
    const [recipient, setRecipient] = useState<string>();
    const [amount, setAmount] = useState<number>(0);

    const createSignDoc = (account: BaseAccount, recipient: string, amount: number, gas: number): StdSignDoc => {
      return {
        msgs: [
          {
            type: "/bank.MsgSend",
            value: {
              from_address: account.address,
              to_address: recipient,
              amount: `${amount}${config.token.coinMinimalDenom}`,
            }
          }
        ],
        fee: { amount: [{
          amount: "1",
          denom: config.token.coinMinimalDenom
        }], gas: gas.toString() },
        chain_id: config.chainId!,
        memo: "",
        account_number: account.account_number,
        sequence: account.sequence,
      };

    };

    const submit = async () => {
      if (!address || !recipient || !amount) {
        return;
      }
      const signer = getSigner();
      if (!client || !signer) {
        return;
      }

      setLoading.on();

      try {
        const account = await client.getAccount(address);
        const signDoc = createSignDoc(account.BaseAccount, recipient, amount * 10**6, 60000);
        console.log(signDoc);
        const signature = await signer.signAmino(address, signDoc);
        console.log(signature);
  
        const txBz = makeProtoTx(signature.signed, signature.signature);
        const response = await client.broadcastTx(txBz);
        await refreshBalance();
        alert("Tx: " + response.hash);
        console.log(response);
      } catch (error) {
        alert("Error");
        console.log(error);
      } finally {
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