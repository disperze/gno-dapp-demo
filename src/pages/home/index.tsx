import * as React from "react"
import { Link as ReactRouterLink } from "react-router-dom";
import {
  Link,
  VStack,
} from "@chakra-ui/react"

export const Home = () => (
  <VStack spacing={8}>
    <Link
      color="teal.500"
      as={ReactRouterLink}
      to="/r/demo/boards:testboard"
      fontSize="2xl"
    >
      Go to gnolang board.
    </Link>
  </VStack>
)