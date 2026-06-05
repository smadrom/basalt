import { useAuthStore } from '@basalt/shared';
import { LoginScreen } from './screens/LoginScreen.tsx';
import { HomeScreen } from './screens/HomeScreen.tsx';

export function App() {
  const token = useAuthStore((s) => s.token);
  return token ? <HomeScreen /> : <LoginScreen />;
}
