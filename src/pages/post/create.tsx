import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Stack,
    Button,
    Heading,
    useColorModeValue,
    NumberInput,
    NumberInputField,
    useBoolean,
    Textarea,
    Input,
    Link,
    useToast,
  } from '@chakra-ui/react';
  import { useSearchParams } from 'react-router-dom';
  import { useState } from 'react';
  import { StdSignDoc } from "@cosmjs/amino";
  import { LcdClient, parseBoards, parseResultId, useSdk } from '../../services';
  import { BaseAccount, makeGnoStdTx } from '../../services';
import { ExternalLinkIcon } from '@chakra-ui/icons';
  
  export const NewPost = () => {
    const toast = useToast();
    const [searchParams ] = useSearchParams();
    const { address, client, getSigner, config, refreshBalance } = useSdk();
  
    const [loading, setLoading] = useBoolean();
    const [bid, setBid] = useState<number>(getQueryInt("bid"));
    const [title, setTitle] = useState<string>();
    const [body, setBody] = useState<string>();
  
    function getQueryInt(key: string): number {
      return parseInt(searchParams.get(key) ?? '0');
    }
  
    const createPostMsg = (sender: string, bid: number, title: string, body: string) => {
      return  {
        type: "/vm.m_call",
        value: {
          caller: sender,
          send: "",
          pkg_path: "gno.land/r/boards",
          func: "CreatePost",
          args: [
            bid.toString(),
            title,
            body
          ]
        }
      };
    }
  
    const createSignDoc = (account: BaseAccount, msg: any, gas: number): StdSignDoc => {
      return {
        msgs: [msg],
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
  
    const getPostUrl = async (cli: LcdClient, bid: number, data: string) => {
      const boards = await cli.render("gno.land/r/boards");
      const boardList = parseBoards(boards);
      if (boardList.length > 0) {
        const newPostId = parseResultId(data);
        return `https://gno.land${boardList[bid-1]}/${newPostId}`;
      }
      return undefined;
    };

    const submit = async () => {
      if (!address || !bid || !title || !body) {
        return;
      }
      const signer = getSigner();
      if (!client || !signer) {
        return;
      }
  
      setLoading.on();
  
      try {
        // TODO: clear body special chars
        const msg = createPostMsg(address, bid, title, body);
        const account = await client.getAccount(address);
        const signDoc = createSignDoc(account.BaseAccount, msg, 2000000);
        const signature = await signer.signAmino(address, signDoc);
  
        const stdTx = makeGnoStdTx(signature.signed, signature.signature);
        const response = await client.broadcastTx(stdTx);
        await refreshBalance();
        const postUrl = await getPostUrl(client, bid, response.result.Data);
        toast({
          title: `Transaction Successful`,
          description: (<Link href={postUrl} isExternal >View post <ExternalLinkIcon mx='2px' /></Link>),
          status: "success",
          position: "bottom-right",
          isClosable: true,
        });
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
      mt={4}
      justify={'center'}>
      <Stack spacing={8} mx={'auto'} maxW={'lg'}>
        <Stack align={'center'}>
          <Heading fontSize={'4xl'} textAlign={'center'}>
            Create Post
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
            <FormControl id="bid">
              <FormLabel>bid</FormLabel>
              <NumberInput
                value={bid}
                onChange={(_, value) => setBid(value)}>
                <NumberInputField />
              </NumberInput>
            </FormControl>
            <FormControl id="title">
              <FormLabel>title</FormLabel>
              <Input
                onChange={(e) => setTitle(e.target.value)} />
            </FormControl>
            <FormControl id="body">
              <FormLabel>body</FormLabel>
              <Textarea
                onChange={(e) => setBody(e.target.value)}
                size='sm'
              />
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
               Post
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};