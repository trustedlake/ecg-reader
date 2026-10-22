import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import type { ReactNode } from "react";
import { useNavigation } from "@react-navigation/native";
import { colors, useAuth } from "shared";
import BackButton from "./BackButton";
import Icon from "./Icon";

interface AppHeaderProps {
  title: string;
  /** Back arrow, drawn to the right of the Home icon. */
  onBack?: () => void;
  right?: ReactNode;
}

export default function AppHeader({ title, onBack, right }: AppHeaderProps) {
  const navigation = useNavigation<{ navigate: (name: "Home") => void }>();
  const { isAuthenticated, logout } = useAuth();
  return (
    <View style={styles.header}>
      <View style={styles.row}>
        <View style={styles.side}>
          {isAuthenticated && (
            <Pressable
              onPress={() => navigation.navigate("Home")}
              accessibilityRole="button"
              accessibilityLabel="Home"
              hitSlop={8}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
              testID="header-home"
            >
              <Icon name="home" size={24} color={colors.dark} />
            </Pressable>
          )}
          {/* Home never moves: the back arrow sits to its right. */}
          {onBack && <BackButton onPress={onBack} />}
        </View>
        <View style={[styles.side, styles.right]}>
          {isAuthenticated && (
            <Pressable
              onPress={logout}
              accessibilityRole="button"
              accessibilityLabel="Log out"
              hitSlop={8}
              style={({ pressed }) => [styles.back, pressed && styles.pressed]}
              testID="header-logout"
            >
              <Icon name="logout" size={24} color={colors.secondary} />
            </Pressable>
          )}
          {right}
        </View>
      </View>
      {/* Left-aligned under the icons, clear of the phone's camera island at the top centre. */}
      <Text style={styles.title} numberOfLines={2} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
  },
  side: { minWidth: 88, flexDirection: "row", alignItems: "center" },
  right: { justifyContent: "flex-end" },
  back: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    paddingHorizontal: 2,
    fontSize: 24,
    fontWeight: "700",
    color: colors.dark,
  },
  pressed: { opacity: 0.6 },
});
