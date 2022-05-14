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
    useColorModeValue,
    Flex,
    useColorMode,
} from '@chakra-ui/react';
import {
  ChatIcon,
  DeleteIcon,
} from '@chakra-ui/icons';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  createDeleteMsg,
  createReplyMsg,
  createSignDoc,
  ellideMiddle,
  makeProtoTx,
  useSdk
} from '../../services';
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import remarkGfm from 'remark-gfm';
import emoji from 'remark-emoji';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ReplyArgs {
    isReply: boolean,
    bid: number;
    threadId: number;
    postId: number;
}

function Cards(props: any){
  return (
    <Flex
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
        <Box mt={2} color={useColorModeValue("gray.600", "gray.300")}>
        {props.children}
        </Box>
      </Box>
    </Flex>
  );
};

export const Board = () => {
    const toast = useToast();
    const location = useLocation();
    const { colorMode } = useColorMode();
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

    const submitAction = async () => {
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
          const msg = replyParams.isReply ? createReplyMsg(address, replyParams.bid, replyParams.threadId, replyParams.postId, message)
          : createDeleteMsg(address, replyParams.bid, replyParams.threadId, replyParams.postId, message);;
          const account = await client.getAccount(address);
          const signDoc = createSignDoc(account, msg, config, 2000000);
          const signature = await signer.signAmino(address, signDoc);

          const txBytes = makeProtoTx(signature.signed, signature.signature);
          const response = await client.broadcastTx(txBytes);
          // const txHash: Uint8Array = await (window as any).keplr.sendTx("testchain", txBytes, "block");
          console.log(response);
          toast({
            title: `Transaction Successful`,
            description: `${ellideMiddle(response.txhash, 28)}`,
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

      const openReplyModal = (params: any, reply?: boolean) => {
        const newParams: ReplyArgs = {
            isReply: reply ?? true,
            bid: Number(params.bid),
            threadId: Number(params.threadid),
            postId: Number(params.postid),
        };
        setReplyParams(newParams);
        setMessage("");
        onOpen();
    };

      const replyModal = (
        <>
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{replyParams?.isReply ? "CreateReply" : "DeletePost"}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl id="message">
                    <FormLabel>{replyParams?.isReply ? "Message" : "Reason"}</FormLabel>
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
                    onClick={submitAction}>
                  {replyParams?.isReply ? "Post" : "Delete"}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      );

    const parseQueryParams = (url: string) => {
      const queryParams: any = {}; 
      url.split('&').forEach((param: string) => {
          const [key, value] = param.split('=');
          queryParams[key] = value;
      });

      return queryParams;
    };
    const newTheme = {
        a: (props: any) => {
          const { children, href } = props;
          if (href.startsWith('/')) {
              const replyUrl = '/r/boards?help&__func=CreateReply&';
              if (href.startsWith(replyUrl)) {
                  const queryParams = parseQueryParams(href.replace(replyUrl, '')); 

                  return (
                    <Button colorScheme='teal' variant='link'
                        onClick={() => openReplyModal(queryParams)}>
                        <ChatIcon mr='2px' h={3}/> {children}
                    </Button>
                  );
              }

              const deleteUrl = '/r/boards?help&__func=DeletePost&';
              if (href.startsWith(deleteUrl)) {
                  const queryParams = parseQueryParams(href.replace(deleteUrl, '')); 

                  return (
                    <Button colorScheme='teal' variant='link'
                        onClick={() => openReplyModal(queryParams, false)}>
                        <DeleteIcon mr='2px' h={3}/> 
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
        code: ({node, inline, className, children, ...props}: any) => {
          const match = /language-(\w+)/.exec(className || '')
          return !inline && match ? (
            <SyntaxHighlighter
              children={String(children).replace(/\n$/, '')}
              {...(colorMode === "dark" && {style: darcula})}
              language={match[1]}
              PreTag="div"
              customStyle={{maxWidth: "94vw"}}
              {...props}
            />
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          )
        }  
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

