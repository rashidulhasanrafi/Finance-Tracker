import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';

export async function safeCopy(text: string) {
  try {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Text copied to clipboard");
  } catch (err) {
    console.error("Clipboard error", err);
  }
}