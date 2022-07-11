import * as React from "react"
import {
  BrowserRouter as Router,
  Navigate,
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
import { NewPost } from "./pages/post"
import { Board } from "./pages/board"
import { NewUser } from "./pages/user/create"

export const App = () => (
  <ChakraProvider theme={theme}>
    <SdkProvider config={config}>
    <Box fontSize="xl">
      <Grid minH="100vh" pt={2}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="transfer" element={<Transfer />} />
            <Route path="create-post" element={<NewPost />} />
            <Route path="create-user" element={<NewUser />} />
            <Route path="reply-post" element={<Navigate to="/r/boards:testboard/8" replace />} />
            <Route path="r/*" element={<Board />} />
          </Routes>
        </Router>
      </Grid>
    </Box>
    </SdkProvider>
  </ChakraProvider>
)
