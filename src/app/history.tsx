import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

import { ensureAnonymousUser, supabase } from "@/lib/supabase";

const PAGE_SIZE = 25;

type Trip = {
  id: string;
  start_time: string;
  end_time: string | null;
  started_at: string;
  stopped_at: string | null;
  start_latitude: number;
  start_longitude: number;
  stop_latitude: number | null;
  stop_longitude: number | null;
};

export default function HistoryScreen() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isFocused = useRef(false);
  const hasLoaded = useRef(false);
  const isRequestInFlight = useRef(false);
  const nextOffset = useRef(0);
  const hasMoreRef = useRef(true);

  const loadPage = useCallback(async (reset = false) => {
    if (
      isRequestInFlight.current ||
      (!reset && !hasMoreRef.current)
    ) {
      return;
    }

    isRequestInFlight.current = true;
    if (reset) {
      setErrorMessage(null);
      if (hasLoaded.current) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
    } else {
      setIsLoadingMore(true);
    }

    const from = reset ? 0 : nextOffset.current;

    try {
      const userId = await ensureAnonymousUser();
      const { data, error } = await supabase
        .from("driver_sessions_readable")
        .select(
          "id, start_time, end_time, started_at, stopped_at, start_latitude, start_longitude, stop_latitude, stop_longitude",
        )
        .eq("user_id", userId)
        .order("started_at", { ascending: false })
        .range(from, from + PAGE_SIZE - 1);

      if (error) {
        throw error;
      }

      const page = (data ?? []) as Trip[];
      nextOffset.current = from + page.length;
      hasMoreRef.current = page.length === PAGE_SIZE;
      hasLoaded.current = true;

      if (isFocused.current) {
        setTrips((currentTrips) => (reset ? page : [...currentTrips, ...page]));
        setHasMore(hasMoreRef.current);
      }
    } catch (error) {
      if (isFocused.current) {
        setErrorMessage(
          `Unable to load trip history: ${getErrorMessage(error)}`,
        );
      }
    } finally {
      isRequestInFlight.current = false;
      if (isFocused.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      isFocused.current = true;
      void loadPage(true);

      return () => {
        isFocused.current = false;
      };
    }, [loadPage]),
  );

  const renderTrip = ({ item, index }: { item: Trip; index: number }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripNumber}>TRIP {index + 1}</Text>
        {!item.stopped_at ? (
          <Text style={styles.activeBadge}>IN PROGRESS</Text>
        ) : null}
      </View>

      <View style={styles.timeline}>
        <View style={styles.timelineRail}>
          <View style={styles.startDot} />
          <View style={styles.timelineLine} />
          <View style={styles.endDot} />
        </View>

        <View style={styles.timelineDetails}>
          <View style={styles.stop}>
            <Text style={styles.stopLabel}>STARTED</Text>
            <Text style={styles.stopTime}>{item.start_time}</Text>
            <Text style={styles.coordinates}>
              {formatCoordinates(item.start_latitude, item.start_longitude)}
            </Text>
          </View>

          <View style={styles.stop}>
            <Text style={styles.stopLabel}>ENDED</Text>
            {item.end_time ? (
              <>
                <Text style={styles.stopTime}>{item.end_time}</Text>
                {item.stop_latitude !== null &&
                item.stop_longitude !== null ? (
                  <Text style={styles.coordinates}>
                    {formatCoordinates(
                      item.stop_latitude,
                      item.stop_longitude,
                    )}
                  </Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.pendingTime}>Trip in progress</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <StatusBar style="dark" />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderTrip}
        onEndReached={() => void loadPage()}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => void loadPage(true)}
            tintColor={colors.orange}
            colors={[colors.orange]}
          />
        }
        ListHeaderComponent={
          <View style={styles.heading}>
            <Text style={styles.title}>Trip history</Text>
            <Text style={styles.subtitle}>
              Your recent drives, all in one place.
            </Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator
              style={styles.initialLoader}
              size="large"
              color={colors.orange}
            />
          ) : errorMessage ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>History unavailable</Text>
              <Text style={styles.emptyMessage}>{errorMessage}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => void loadPage(true)}
                style={styles.retryButton}
              >
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No trips yet</Text>
              <Text style={styles.emptyMessage}>
                Your completed and in-progress trips will appear here.
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          trips.length > 0 ? (
            <View style={styles.listFooter}>
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.orange} />
              ) : null}
              {errorMessage ? (
                <Text accessibilityLiveRegion="polite" style={styles.footerError}>
                  {errorMessage}
                </Text>
              ) : null}
              {!hasMore && !isLoadingMore ? (
                <Text style={styles.endOfHistory}>You’re all caught up.</Text>
              ) : null}
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

const colors = {
  background: "#F5F0E8",
  white: "#FFFFFF",
  text: "#211A16",
  muted: "#79695C",
  orange: "#C8753D",
  camel: "#C49A6C",
  rail: "#E8DED2",
  error: "#A13C2F",
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
  },
  heading: {
    marginBottom: 24,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 6,
  },
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    marginBottom: 14,
    padding: 18,
    shadowColor: "#4A3324",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  tripHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  tripNumber: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  activeBadge: {
    backgroundColor: "#F8E9DB",
    borderRadius: 10,
    color: colors.orange,
    fontSize: 10,
    fontWeight: "700",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  timeline: {
    flexDirection: "row",
  },
  timelineRail: {
    alignItems: "center",
    marginRight: 14,
    paddingTop: 4,
    width: 14,
  },
  startDot: {
    backgroundColor: colors.orange,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  timelineLine: {
    backgroundColor: colors.rail,
    flex: 1,
    marginVertical: 4,
    minHeight: 24,
    width: 2,
  },
  endDot: {
    backgroundColor: colors.camel,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  timelineDetails: {
    flex: 1,
    gap: 20,
  },
  stop: {
    gap: 3,
  },
  stopLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  stopTime: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  coordinates: {
    color: colors.muted,
    fontSize: 12,
  },
  pendingTime: {
    color: colors.camel,
    fontSize: 14,
    fontWeight: "600",
  },
  initialLoader: {
    marginTop: 48,
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyMessage: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.orange,
    borderRadius: 12,
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "700",
  },
  listFooter: {
    alignItems: "center",
    minHeight: 36,
    paddingTop: 10,
  },
  footerError: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },
  endOfHistory: {
    color: colors.muted,
    fontSize: 12,
  },
});
