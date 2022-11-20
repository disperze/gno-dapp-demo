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
    Textarea,
    Input,
    Link,
    useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import {
  createUserMsg,
  useSdk
} from '../../services';

import { ExternalLinkIcon } from '@chakra-ui/icons';
  
export const NewUser = () => {
    const toast = useToast();
    const { address, getSignerClient, refreshBalance } = useSdk();
  
    const [loading, setLoading] = useBoolean();
    const [username, setUsername] = useState<string>();
    const [inviter, setInviter] = useState<string>();
    const [profile, setProfile] = useState<string>();

    const submit = async () => {
      if (!address || !username) {
        return;
      }
      const gno = getSignerClient();
      if (!gno) {
        return;
      }
  
      setLoading.on();
  
      try {
        const msg = createUserMsg(address, inviter ?? "", username,  profile ?? "");
        const response = await gno.signAndBroadcast(address, [msg]);
        await refreshBalance();
        const userUrl = `/r/demo/users:${username}`;
        toast({
          title: `Transaction Successful`,
          description: (<Link href={userUrl}>View user <ExternalLinkIcon mx='2px' /></Link>),
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
            Create User
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
            <FormControl id="username" isRequired>
              <FormLabel>username</FormLabel>
              <Input
                onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl id="inviter">
              <FormLabel>inviter</FormLabel>
              <Input
                onChange={(e) => setInviter(e.target.value)} />
            </FormControl>
            <FormControl id="profile">
              <FormLabel>profile</FormLabel>
              <Textarea
                onChange={(e) => setProfile(e.target.value)}
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
               Create
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Flex>
  );
};