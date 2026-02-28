import { Switch, Route } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout';
import { AnimatePresence } from 'framer-motion';

import Exchange from '@/pages/Exchange';
import Home from '@/pages/Home';
import CalendarView from '@/pages/Calendar';
import Support from '@/pages/Support';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AnimatePresence mode="wait">
      <Switch>
        <Route path="/" component={Exchange} />
        <Route path="/home" component={Home} />
        <Route path="/calendar" component={CalendarView} />
        <Route path="/support" component={Support} />
        <Route path="/admin" component={Admin} />
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
    </QueryClientProvider>
  );
}
