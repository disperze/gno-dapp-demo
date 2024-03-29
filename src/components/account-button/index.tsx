import * as React from "react";
import {
  Button,
  useColorModeValue,
  Avatar,
  useBoolean,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Box,
  chakra,
  Text,
  GridItem,
  Grid,
  Flex,
  Badge,
  useDisclosure,
  PopoverBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
} from '@chakra-ui/react';
import { MdAccountBalanceWallet } from "react-icons/md";
import {
  GnoClient,
  loadAdenaWallet,
  loadLedgerWallet,
  loadOrCreateWalletDirect,
  useSdk,
  webUsbMissing
} from "../../services";
import { config } from "../../config";
import {
  configKeplr,
  loadKeplrWallet,
  WalletLoader,
  formatPrice,
  getTokenConfig,
  delay,
} from "../../services";
import userLogo from "../../assets/user-default.svg";

export function AccountButton(): JSX.Element {
  const sdk = useSdk();
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [loading, setLoading] = useBoolean();
  const walletOpts = useDisclosure();

  async function init(loadWallet: WalletLoader) {
    const signer = await loadWallet(config.chainId, config.addressPrefix);
    const clientSigner = new GnoClient(config, signer, sdk.client!);
    sdk.init(clientSigner);
  }

  async function connectKeplr() {
    const w = window as any;
    if (!w.keplr) {
      alert("Install keplr");
      return;
    }

    walletOpts.onClose();
    setLoading.on();

    try {
      await w.keplr.experimentalSuggestChain(configKeplr(config));
      await w.keplr.enable(config.chainId);
      init(loadKeplrWallet);

      window.addEventListener('keplr_keystorechange', async () => {
        await init(loadKeplrWallet);
      });
    } catch (error) {
      setLoading.off();
      if (`${error}`.includes("features")) {
        alert(`Keplr v${w.keplr?.version} does not support GNO chain`);
      }
      console.error(error);
    }
  }

  async function connectWallet(loadWallet: WalletLoader) {
    walletOpts.onClose();
    setLoading.on();

    try {
      await delay(500);
      await init(loadWallet);
    } catch (error) {
      setLoading.off();
      console.error(error);
    }
  }

  const BalanceItem = (props: any) => {
    const coin = getTokenConfig(props.coin.denom);

    if (!coin) return (<></>);
    return (
      <Grid templateColumns="repeat(10, 1fr)" gap={4}>
        <GridItem colSpan={2}>
          <Flex h="full" justifyContent="center" alignItems="center">
            <Avatar size="sm" name={coin.name} />
          </Flex>
        </GridItem>
        <GridItem colSpan={8} textAlign="left">
          <chakra.p
            fontSize="xs"
            color="gray.500">Balance</chakra.p>
          <chakra.p fontWeight="semibold">
            {formatPrice(props.coin)}
          </chakra.p>
        </GridItem>
      </Grid>
    );
  };

  const walletModal = (
    <>
      <Modal isOpen={walletOpts.isOpen} onClose={walletOpts.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
          <VStack spacing={4}>
            <Button colorScheme='teal' w={"240px"} variant='outline'
              onClick={() => connectWallet(loadAdenaWallet)}
              disabled={webUsbMissing()}>
              Adena wallet
            </Button>
            <Button colorScheme='teal' w={"240px"} variant='outline'
              onClick={() => connectWallet(loadOrCreateWalletDirect)}>
              Browser wallet
            </Button>
            <Button colorScheme='teal' w={"240px"} variant='outline'
              onClick={() => connectWallet(loadLedgerWallet)}
              disabled={webUsbMissing()}>
              Ledger wallet
            </Button>
            <Button colorScheme='teal' w={"240px"} variant='outline'
              onClick={connectKeplr}>
              Keplr wallet
            </Button>
          </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={walletOpts.onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );

  
  const loginButton = (
    <>
      <Button
        isLoading={loading}
        loadingText="Connecting..."
        rightIcon={<MdAccountBalanceWallet />}
        fontSize={'sm'}
        fontWeight={500}
        variant={'outline'}
        borderRadius="50px"
        height="var(--chakra-sizes-9)"
        marginTop={"2px"}
        borderColor={useColorModeValue('gray.200', 'whiteAlpha.300')}
        onClick={walletOpts.onOpen}
      >
        Connect wallet
      </Button>
      {walletModal}
    </> 
  );

  const balance = sdk.balance.length > 0 ? sdk.balance : [{ denom: 'gnot', amount: '0' }];
  const accountBox = (
    <Popover
      isOpen={isOpen}
      placement="bottom-start"
      onOpen={onOpen}
      onClose={onClose}>
      <PopoverTrigger>
        <Avatar cursor="pointer" size="sm" name="Gno" src={userLogo} />
      </PopoverTrigger>
      <PopoverContent
        mt="0.5rem"
        maxW="sm"
      >
        <PopoverBody p={0}>
          <VStack
            px={8}
            pt={6}
            pb={3}
            align="left"
          >
            <Box>
              <Badge fontSize="0.6rem" variant="outline" colorScheme="orange">
                GNO Testnet
              </Badge>
              <Text fontSize="md" fontWeight="semibold">{sdk.address}</Text>
            </Box>
            <Box py={2}>
              {balance.map(coin => (
                <BalanceItem key={coin.denom} coin={coin} />
              ))}
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );

  return sdk.address ? accountBox : loginButton;
}
