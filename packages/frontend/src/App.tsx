import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Box, Text } from "@nimbus-ds/components";
import { connect, iAmReady, ErrorBoundary } from "@tiendanube/nexo";
import nexo from "./nexoClient";
import { AppRouter } from "./Router";
import "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function NexoWrapper({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    connect(nexo)
      .then(() => {
        setIsConnected(true);
        iAmReady(nexo);
      })
      .catch(() => {
        setIsConnected(true);
      });
  }, []);

  if (!isConnected) {
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text>Conectando...</Text>
      </Box>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ErrorBoundary nexo={nexo}>
      <QueryClientProvider client={queryClient}>
        <NexoWrapper>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </NexoWrapper>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
