import {
    Box,
    Center,
    Heading,
    Spinner,
    Link,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useToast,
    useBoolean,
    useDisclosure,
    FormLabel,
    FormControl,
    Textarea,
    chakra,
    useColorModeValue,
    Flex,
} from '@chakra-ui/react';
import {
  ChatIcon
} from '@chakra-ui/icons';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { createReplyMsg, createSignDoc, ellideMiddle, makeGnoStdTx, useSdk } from '../../services';
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import remarkGfm from 'remark-gfm';
import emoji from 'remark-emoji';

interface ReplyArgs {
    bid: number;
    threadId: number;
    postId: number;
}

function Cards(props: any){
  return (
    <Flex
      // bg={useColorModeValue("#F9FAFB", "gray.600")}
      py={3} px={4}
      w="full"
    >
      <Box
        px={8}
        py={4}
        rounded="lg"
        shadow="lg"
        borderColor={useColorModeValue("gray.200", "gray.600")}
        borderWidth={1}
        bg={useColorModeValue("white", "gray.800")}
        w="full"
      >
        <Box mt={2}>
          <chakra.p color={useColorModeValue("gray.600", "gray.300")}>
            {props.children}
          </chakra.p>
        </Box>
      </Box>
    </Flex>
  );
};

export const Board = () => {
    const toast = useToast();
    const location = useLocation();
    const { address, client, config, getSigner, balance, refreshBalance } = useSdk();
    const [loading, setLoading] = useBoolean();
    const { onOpen, onClose, isOpen } = useDisclosure()
    
    const [body, setBody] = useState<string>();
    const [message, setMessage] = useState<string>();
    const [replyParams, setReplyParams] = useState<ReplyArgs>();
    const [loaded, setLoaded] = useState<boolean>();

    const replaceUrls = (text: string) => {
        return text.replaceAll("/r/boards?help&__func=CreatePost", "/create-post?");
    };

    useEffect(() => {
        (async function loadData() {
            if (!client) return;
            const params = location.pathname.split(":");

            try {
                const response = await client.render(`gno.land${params[0]}`, params[1]);
                setBody(replaceUrls(response));
            } catch(error) {
                console.log(error);
            } finally {
                setLoaded(true);
            }
        })();
    }, [client, location]);
  
    const reloadPage = async () => {
        if (!client) return;
        const params = location.pathname.split(":");

        try {
            const response = await client.render(`gno.land${params[0]}`, params[1]);
            setBody(replaceUrls(response));
        } catch(error) {
            alert(error);
        }
    };

    const submitReply = async () => {
        if (!address || !replyParams || !message) {
          return;
        }

        const signer = getSigner();
        if (!client || !signer) {
          return;
        }

        if (!balance || balance.length === 0 || Number(balance[0].amount) < 1) {
          toast({
            title: "Error",
            description: `You need at least 0.000001 GNOT.`,
            status: "error",
            position: "bottom-right",
            isClosable: true,
          });
          return;
        }
    
        setLoading.on();
    
        try {
          const msg = createReplyMsg(address, replyParams.bid, replyParams.threadId, replyParams.postId, message);
          const account = await client.getAccount(address);
          const signDoc = createSignDoc(account.BaseAccount, msg, config, 2000000);
          const signature = await signer.signAmino(address, signDoc);
    
          const stdTx = makeGnoStdTx(signature.signed, signature.signature);
          const response = await client.broadcastTx(stdTx);
          toast({
            title: `Transaction Successful`,
            description: `${ellideMiddle(response.hash, 28)}`,
            status: "success",
            position: "bottom-right",
            isClosable: true,
          });

          onClose();
          await refreshBalance();
          await reloadPage();
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

      const openReplyModal = (params: any) => {
        const newParams: ReplyArgs = {
            bid: Number(params.bid),
            threadId: Number(params.threadid),
            postId: Number(params.postid),
        };
        setReplyParams(newParams);
        onOpen();
    };

      const replyModal = (
        <>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>CreateReply</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl id="message">
                    <FormLabel>Message</FormLabel>
                    <Textarea
                        onChange={(e) => setMessage(e.target.value)}
                        size='lg'
                    />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button
                    disabled={!address}
                    isLoading={loading}
                    colorScheme='blue'
                    onClick={submitReply}>
                  Post
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      );

    const newTheme = {
        a: (props: any) => {
          const { children, href } = props;
          if (href.startsWith('/')) {
              const replyUrl = '/r/boards?help&__func=CreateReply&';
              if (href.startsWith(replyUrl)) {
                  const queryParams: any = {}; 
                  href.replace(replyUrl, '').split('&').forEach((param: string) => {
                      const [key, value] = param.split('=');
                      queryParams[key] = value;
                  });

                  return (
                    <Button colorScheme='teal' variant='link'
                        onClick={() => openReplyModal(queryParams)}>
                        <ChatIcon mr='2px' h={3}/> {children}
                    </Button>
                  );
              }

              return (
                <Link textDecoration="underline" as={ReactRouterLink} to={href}>
                    {children}
                </Link>
              );
          }
          return (
            <Link textDecoration="underline" href={href} isExternal>
              {children}
            </Link>
          );
        },
        blockquote: (props: any) => {
          const { children } = props;
          return (
            <Cards>
              {children}
            </Cards>
          );
        },
    };

    const bodyData = body ? 
        <>
            <ReactMarkdown 
                components={ChakraUIRenderer(newTheme)}
                children={body}
                remarkPlugins={[remarkGfm, emoji]}
            />
            {replyModal}
        </>
        : <Center><Heading>Not found</Heading></Center>;

    return (
        <Box
        mx={8} my={2}>
            {loaded ? bodyData : <Center><Spinner /></Center>}
      </Box>
    );
};

