import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleToggle = async () => {
    if (isLocating) {
      return;
    }

    const action = isStarted ? "stop" : "start";
    setIsStarted(!isStarted);
    setIsLocating(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn(`Location permission was not granted; unable to record ${action} coordinates.`);
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      console.log(`GPS coordinates (${action}):`, {
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
    } catch (error) {
      console.error(`Unable to retrieve GPS coordinates on ${action}:`, error);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Text style={styles.circleRatingText}>96</Text>
          <Text style={styles.circleText}>Driver Rating</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          accessibilityRole="button"
          disabled={isLocating}
          style={({ pressed }) => [
            styles.button,
            isStarted && styles.buttonStarted,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => void handleToggle()}
        >
          <Text style={styles.buttonText}>{isStarted ? "Stop" : "Start"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000000',
    alignItems: "center",
    justifyContent: "center"
  },
  circleContainer: {
    marginBottom: 40
  },
  circle: {
    width: 350,
    height: 350,
    borderRadius: 175,
    borderWidth: 10,
    borderColor: "#27F587",
    
    alignItems: 'center',
    justifyContent: 'center'
  },
  circleRatingText: {
    color: '#27F587',
    fontWeight: 'bold',
    fontSize: 50
  },
  circleText: {
    color: '#27F587',
  },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    backgroundColor: '#27B4F5',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    width: 180,
    alignItems: "center",
  },
  buttonStarted: {
    backgroundColor: "#E53935",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
  }
});