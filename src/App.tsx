import * as React from "react"
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom"
import {
  ChakraProvider,
  Box,
  Grid,
  theme,
} from "@chakra-ui/react"
import { Home } from "./pages/home"
import { Transfer } from "./pages/transfer"
import { SdkProvider } from "./services"
import { config } from "./config";
import { Navbar } from "./components/navbar"
import { NewPost, ReplyPost } from "./pages/post"

export const App = () => (
  <ChakraProvider theme={theme}>
    <SdkProvider config={config}>
    <Box textAlign="center" fontSize="xl">
      <Grid minH="100vh" pt={2}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="create-post" element={<NewPost />} />
            <Route path="reply-post" element={<ReplyPost />} />
          </Routes>
        </Router>
      </Grid>
    </Box>
    </SdkProvider>
  </ChakraProvider>
)
