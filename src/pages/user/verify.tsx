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
import { formatPrice, useSdk } from '../../services';
import { fromBech32, toBech32 } from '@cosmjs/encoding';

export const NewVerifyBalance = () => {
    const toast = useToast();
    const { client } = useSdk();
  
    const [loading, setLoading] = useBoolean();
    const [address, setAddress] = useState<string>();
    const [result, setResult] = useState<string>();
    const [gnoAddress, setGnoAddress] = useState<string>();

    const submit = async () => {
      if (!address || !client) {
        return;
      }
  
      setLoading.on();
  
      try {
        const { data } = fromBech32(address)
        const gnoAddress = toBech32("g", data);
        const res = await client.getBalance(gnoAddress);
        if (res.balances.length === 0) {
          setGnoAddress("");
          setResult("Address not found");
        } else {
          setGnoAddress(gnoAddress);
          setResult(formatPrice(res.balances[0]));
        }
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
            GNO Balance
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
                placeholder="cosmos14vhcds..lmfkx0, juno14vhcds...m0ff2dn"
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
               Verify
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
            {gnoAddress && <span>{gnoAddress} <br /></span>}
            {result}
          </Text>
        </Box>
      </Stack>
    </Flex>
  );
};