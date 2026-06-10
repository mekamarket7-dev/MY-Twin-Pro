import { Redirect } from 'expo-router';
export default function Index() {
  // يعرض splash مباشرة
  return <Redirect href="/splash" />;
}
