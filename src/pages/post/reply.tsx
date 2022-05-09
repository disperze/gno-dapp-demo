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
  useToast,
  Link,
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { createReplyMsg, createSignDoc, LcdClient, parseBoards, parseResultId, useSdk, makeProtoTx } from '../../services';

export const ReplyPost = () => {
  const toast = useToast();
  const [searchParams ] = useSearchParams();
  const { address, client, getSigner, config, refreshBalance } = useSdk();

  const [loading, setLoading] = useBoolean();
  const [bid, setBid] = useState<number>(getQueryInt("bid"));
  const [threadId, setThreadId] = useState<number>(getQueryInt("threadid"));
  const [postId, setPostId] = useState<number>(getQueryInt("postid"));
  const [body, setBody] = useState<string>();

  function getQueryInt(key: string): number {
    return parseInt(searchParams.get(key) ?? '0');
  }

  const getReplyUrl = async (cli: LcdClient, bid: number, threadid: number, data: string) => {
    const boards = await cli.render("gno.land/r/boards");
    const boardList = parseBoards(boards);
    if (boardList.length > 0) {
      const newPostId = parseResultId(data);
      const replyUrl = `${boardList[bid-1]}/${threadId}/${newPostId}`

      return replyUrl;
    }
    return undefined;
  };

  const submit = async () => {
    if (!address || !bid || !threadId || !postId || !body) {
      return;
    }
    const signer = getSigner();
    if (!client || !signer) {
      return;
    }

    setLoading.on();

    try {
      // TODO: clear body special chars
      const msg = createReplyMsg(address, bid, threadId, postId, body);
      const account = await client.getAccount(address);
      const signDoc = createSignDoc(account, msg, config, 2000000);
      const signature = await signer.signAmino(address, signDoc);

      const stdTx = makeProtoTx(signature.signed, signature.signature);
      const response = await client.broadcastTx(stdTx);
      await refreshBalance();
      const replyUrl = await getReplyUrl(client, bid, threadId, response.data);
      toast({
        title: `Transaction Successful`,
        description: (<Link href={replyUrl} >View reply </Link>),
        status: "success",
        position: "bottom-right",
        isClosable: true,
      });

      console.log(response);
    } catch (error) {
      toast({
        title: "Error",
        description: `${error}`,
        status: "error",
        position: "bottom-right",
        isClosable: true,
      });
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
          Create Reply
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
          <FormControl id="threadid">
            <FormLabel>threadid</FormLabel>
            <NumberInput
              value={threadId}
              onChange={(_, value) => setThreadId(value)}>
              <NumberInputField />
            </NumberInput>
          </FormControl>
          <FormControl id="postid">
            <FormLabel>postid</FormLabel>
            <NumberInput
              value={postId}
              onChange={(_, value) => setPostId(value)}>
              <NumberInputField />
            </NumberInput>
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
             Reply
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  </Flex>
 );
};