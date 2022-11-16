import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Stack,
    Button,
    Heading,
    useColorModeValue,
    useBoolean,
    Input,
    Text,
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useSdk, normalizeBech32 } from '../../services';

export const Faucet = () => {
    const toast = useToast();
    const { client } = useSdk();
  
    const [loading, setLoading] = useBoolean();
    const [address, setAddress] = useState<string>();
    const [result, setResult] = useState<string>();

    const submit = async () => {
      if (!address || !client) {
        return;
      }
      setLoading.on();
  
      try {
        setResult("");
        const gnoAddress = normalizeBech32("g", address);
        const res = await client.getBalance(gnoAddress);
        if (res.balances.length > 0) {
            toast({
                title: "Address has balance",
                status: "error",
                position: "bottom-right",
                isClosable: true,
            });
            return;
        }

        const msgResult = await client.faucet(gnoAddress);
        setResult(msgResult);
      } catch (error) {
        console.log(error);
        toast({
          title: "Error",
          description: `${error}`,
          status: "error",
          position: "bottom-right",
          isClosable: true,
        });
      } finally {
        setLoading.off();
      }
    };
  
  return (
    <Flex
      align={'center'}
      mt={4}
      justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            GNO Test3 Faucet
          </Heading>
        </Stack>
        <Box
          rounded={'lg'}
          bg={useColorModeValue('white', 'gray.700')}
          boxShadow={'lg'}
          w={"520px"}
          px={10}
          py={16}>
          <Stack spacing={4}>
            <FormControl id="address" isRequired>
              <FormLabel>Address</FormLabel>
              <Input
                placeholder="g14vhcds...m0ff2dn"
                onChange={(e) => setAddress(e.target.value)} />
            </FormControl>
            <Stack spacing={10} pt={2}>
              <Button
                disabled={!address}
                onClick={submit}
                isLoading={loading}
                size="lg"
                bg={'blue.400'}
                color={'white'}
                _hover={{
                  bg: 'blue.500',
                }}>
               Get test tokens
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Box
          hidden={loading || !result}
          p={4}
          textAlign="center"
          bgColor={"blue.400"}
          w={"520px"}>
          <Text color={'white'}>
            {result}
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
};