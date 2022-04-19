import * as React from "react"
import {
  Link,
  VStack,
} from "@chakra-ui/react"

export const Home = () => (
  <VStack spacing={8}>
    <Link
      color="teal.500"
      href="https://gno.land"
      fontSize="2xl"
      target="_blank"
      rel="noopener noreferrer"
    >
      Go to gno.land
    </Link>
  </VStack>
)