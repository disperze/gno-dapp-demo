import * as React from "react";
import { Link as ReactRouterLink } from "react-router-dom"
import {
  Box,
  Flex,
  Text,
  IconButton,
  Button,
  Stack,
  Collapse,
  Link,
  useColorModeValue,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
} from '@chakra-ui/icons';
import { ColorModeSwitcher } from "../../ColorModeSwitcher";
import { AccountButton } from "../account-button";

export function Navbar(): JSX.Element {
  const { isOpen, onToggle } = useDisclosure();

  return (
    <Box>
      <Flex
        bg={useColorModeValue('white', 'gray.800')}
        color={useColorModeValue('gray.600', 'white')}
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderBottomColor={useColorModeValue('blue.400', 'gray.300')}
        align={'center'}>
        <Flex
          flex={{ base: 0, md: 'auto' }}
          ml={{ base: -2 }}
          display={{ base: 'flex', md: 'none' }}>
          <IconButton
            onClick={onToggle}
            icon={
              isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
            }
            variant={'ghost'}
            aria-label={'Toggle Navigation'}
          />
        </Flex>
        <Flex flex={{ base: 1 }}>
          <Link
            as={ReactRouterLink}
            to="/r/boards:testboard"
            _hover={{
              textDecoration: 'none',
            }}>
            <Text
              bgGradient='linear(to-l, #295ccd, #00c4ff)'
              bgClip='text'
              fontSize='2xl'
              fontWeight='extrabold'
            >
              GnoLand Test2
            </Text>
          </Link>
        </Flex>

        <Stack
          flex={{ base: 1, md: 0 }}
          justify={'flex-end'}
          direction={'row'}
          spacing={6}>
          <DesktopNav />
          <AccountButton />
          <ColorModeSwitcher display={{ base: 'none', md: 'inline-flex' }} />
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  return (
    <Stack direction={'row'} spacing={6} display={{ base: 'none', md: 'inline-flex' }}>
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}
          fontSize={'sm'}
          fontWeight={500}
          variant={'outline'}
          borderRadius="50px"
          height="var(--chakra-sizes-8)"
          mt={"4px"}
          ml={"10px"}
          borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
        >
          Pages
        </MenuButton>
        <MenuList>
        <MenuItem>
            <Link w="full" href="https://test2.gno.land/faucet" isExternal>Faucet <ExternalLinkIcon mx='2px' /></Link>
          </MenuItem>
          <MenuItem>
            <Link as={ReactRouterLink} w="full" to='/transfer'>Transfer</Link>
          </MenuItem>
          <MenuItem>
            <Link as={ReactRouterLink} w="full" to='/create-user'>Create User</Link>
          </MenuItem>
          <MenuItem>
            <Link as={ReactRouterLink} w="full" to='/create-post'>Create Post</Link>
          </MenuItem>
          {/* <MenuItem>
            <Link as={ReactRouterLink} w="full" to='/reply-post'>Reply Post</Link>
          </MenuItem> */}
        </MenuList>
      </Menu>
    </Stack>
  );
};
