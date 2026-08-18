import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { formatNumber, colors } from 'shared';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{ color: colors.primary }}>Open up App.tsx to start working on your app!</Text>
      <Text>Shared formatNumber test: {formatNumber(1234.567, 2)}</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});