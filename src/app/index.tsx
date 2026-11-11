import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ensureAnonymousUser, supabase } from "@/lib/supabase";

export default function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const restoreActiveSession = async () => {
      try {
        const userId = await ensureAnonymousUser();
        const { data, error } = await supabase
          .from("driver_sessions")
          .select("id")
          .eq("user_id", userId)
          .is("stopped_at", null)
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (isMounted) {
          setActiveSessionId(data?.id ?? null);
          setIsStarted(data !== null);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            `Unable to connect to Supabase: ${getErrorMessage(error)}`,
          );
        }
      } finally {
        if (isMounted) {
          setIsRestoring(false);
        }
      }
    };

    void restoreActiveSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggle = async () => {
    if (isLocating || isRestoring) {
      return;
    }

    const action = isStarted ? "stop" : "start";
    setIsLocating(true);
    setErrorMessage(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Location permission was not granted.");
      }

      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userId = await ensureAnonymousUser();
      if (action === "start") {
        const { data, error } = await supabase
          .from("driver_sessions")
          .insert({
            user_id: userId,
            start_latitude: coords.latitude,
            start_longitude: coords.longitude,
            start_utc_offset_minutes: -new Date().getTimezoneOffset(),
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }
        if (!data) {
          throw new Error("Supabase did not return the new session ID.");
        }

        setActiveSessionId(data.id);
        setIsStarted(true);
      } else {
        if (!activeSessionId) {
          throw new Error("No active session was found to stop.");
        }

        const { error } = await supabase
          .from("driver_sessions")
          .update({
            stopped_at: new Date().toISOString(),
            stop_latitude: coords.latitude,
            stop_longitude: coords.longitude,
            stop_utc_offset_minutes: -new Date().getTimezoneOffset(),
          })
          .eq("id", activeSessionId)
          .eq("user_id", userId)
          .is("stopped_at", null)
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        setActiveSessionId(null);
        setIsStarted(false);
      }
    } catch (error) {
      setErrorMessage(
        `Unable to ${action} the session: ${getErrorMessage(error)}`,
      );
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
          disabled={isLocating || isRestoring}
          style={({ pressed }) => [
            styles.button,
            isStarted && styles.buttonStarted,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => void handleToggle()}
        >
          <Text style={styles.buttonText}>
            {isRestoring
              ? "Connecting..."
              : isLocating
                ? "Saving..."
                : isStarted
                  ? "Stop"
                  : "Start"}
          </Text>
        </Pressable>
        {errorMessage ? (
          <Text accessibilityLiveRegion="polite" style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
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
  },
  errorText: {
    color: "#FF8A80",
    marginHorizontal: 24,
    marginTop: 16,
    textAlign: "center",
  },
});