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
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { StdSignDoc } from "@cosmjs/amino";
import { useSdk } from '../../services';
import { BaseAccount, makeGnoStdTx } from '../../services';

export const Post = () => {
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

  const createReplyMsg = (sender: string, bid: number, threadid: number, postid: number, body: string) => {
    return  {
      type: "/vm.m_call",
      value: {
        caller: sender,
        send: "",
        pkg_path: "gno.land/r/boards",
        func: "CreateReply",
        args: [
          bid.toString(),
          threadid.toString(),
          postid.toString(),
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
      const replyMsg = createReplyMsg(address, bid, threadId, postId, body);
      const account = await client.getAccount(address);
      const signDoc = createSignDoc(account.BaseAccount, replyMsg, 800000);
      const signature = await signer.signAmino(address, signDoc);
      console.log(signature);

      const stdTx = makeGnoStdTx(signature.signed, signature.signature);
      const response = await client.broadcastTx(stdTx);
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