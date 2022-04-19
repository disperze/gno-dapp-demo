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
  VStack,
  Text,
  GridItem,
  Grid,
  Flex,
  Badge,
  useDisclosure,
  PopoverBody,
} from '@chakra-ui/react';
import { MdAccountBalanceWallet } from "react-icons/md";
import { useSdk } from "../../services";
import { config } from "../../config";
import {
  configKeplr,
  loadKeplrWallet,
  WalletLoader,
  formatAddress,
  formatPrice,
  getTokenConfig,
} from "../../services";
import userLogo from "../../assets/user-default.svg";

export function AccountButton(): JSX.Element {
  const sdk = useSdk();
  const { onOpen, onClose, isOpen } = useDisclosure()
  const [loading, setLoading] = useBoolean();

  async function init(loadWallet: WalletLoader) {
    const signer = await loadWallet(config.chainId, config.addressPrefix);
    sdk.init(signer);
  }

  async function connectKeplr() {
    setLoading.on();
    const anyWindow = window as any;
    try {
      await anyWindow.keplr?.experimentalSuggestChain(configKeplr(config));
      await anyWindow.keplr?.enable(config.chainId);
      await init(loadKeplrWallet);
    } catch (error) {
      setLoading.off();
      console.error(error);
    }
  }

  const loginButton = (
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
      onClick={connectKeplr}
    >
      Connect wallet
    </Button>
  );

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
              <Text fontSize="md" fontWeight="semibold">{formatAddress(sdk.address)}</Text>
            </Box>
            <Box py={2}>
              {sdk.balance.map(coin => (
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
