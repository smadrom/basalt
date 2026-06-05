import { useAuthStore } from '@basalt/shared';
import { HomeScreen } from './screens/HomeScreen.tsx';
import { LoginScreen } from './screens/LoginScreen.tsx';

export function App() {
  const token = useAuthStore((s) => s.token);
  return token ? <HomeScreen /> : <LoginScreen />;
}
