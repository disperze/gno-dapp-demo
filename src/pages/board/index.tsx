import {
    Box,
    Center,
    Heading,
    Spinner,
    Link,
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSdk } from '../../services';
import ReactMarkdown from 'react-markdown';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import remarkGfm from 'remark-gfm';
import emoji from 'remark-emoji';

export const Board = () => {
    const location = useLocation();
    const { client } = useSdk();
    const [body, setBody] = useState<string>();
    const [loaded, setLoaded] = useState<boolean>();

    useEffect(() => {
        (async function loadData() {
            if (!client) return;
            const params = location.pathname.split(":");

            try {
                const response = await client.render(`gno.land${params[0]}`, params[1]);
                const newResponse = response.replaceAll("/r/boards?help&__func=CreateReply", "/reply-post?")
                                              .replaceAll("/r/boards?help&__func=CreatePost", "/create-post?")
                setBody(newResponse);
            } catch(error) {
                console.log(error);
            } finally {
                setLoaded(true);
            }
        })();
    }, [client, location]);
  
    const newTheme = {
        a: (props: any) => {
          const { children, href } = props;
          if (href.startsWith('/')) {
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
    };

    const bodyData = body ? 
        <ReactMarkdown 
            components={ChakraUIRenderer(newTheme)}
            children={body}
            remarkPlugins={[remarkGfm, emoji]}
        />
        : <Center><Heading>Not found</Heading></Center>;

    return (
        <Box
        mx={8} my={2}>
            {loaded ? bodyData : <Center><Spinner /></Center>}
      </Box>
    );
};