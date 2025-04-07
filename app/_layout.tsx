import { useState, useEffect } from "react"
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import Header from "../components/Header"
import LightControls from "../components/LightControls"
import StatCards from "../components/StatCards"
import { colors } from "../styles/theme"

// Sample data for lights
const INITIAL_LIGHTS = [
  { id: 1, name: "Living Room", isOn: false, brightness: 70, color: "#FFFFFF" },
  { id: 2, name: "Kitchen", isOn: false, brightness: 80, color: "#F5F5DC" },
  { id: 3, name: "Bedroom", isOn: false, brightness: 50, color: "#E6E6FA" },
  { id: 4, name: "Bathroom", isOn: false, brightness: 90, color: "#F0FFFF" },
]

export default function App() {
  const [lights, setLights] = useState(INITIAL_LIGHTS)
  const [energyUsage, setEnergyUsage] = useState("0.0")
  const [systemStatus, setSystemStatus] = useState("Online")
  const [systemStatusDetail, setSystemStatusDetail] = useState("All systems operational")

  const isDarkMode = useColorScheme() === "dark"
  const backgroundStyle = {
    backgroundColor: isDarkMode ? "#1F2937" : colors.background,
  }

  // Toggle individual light
  const toggleLight = (id: number) => {
    setLights(lights.map((light) => (light.id === id ? { ...light, isOn: !light.isOn } : light)))
  }

  // Update light brightness
  const updateBrightness = (id: number, brightness: number) => {
    setLights(lights.map((light) => (light.id === id ? { ...light, brightness } : light)))
  }

  // Update light color
  const updateColor = (id: number, color: string) => {
    setLights(lights.map((light) => (light.id === id ? { ...light, color } : light)))
  }

  // Toggle all lights
  const toggleAllLights = (on: boolean) => {
    setLights(lights.map((light) => ({ ...light, isOn: on })))
  }

  // Calculate energy usage based on active lights and brightness
  useEffect(() => {
    const activeCount = lights.filter((light) => light.isOn).length
    const totalBrightness = lights.filter((light) => light.isOn).reduce((sum, light) => sum + light.brightness, 0)

    const usage = (activeCount * 0.06 * (totalBrightness / 100)).toFixed(1)
    setEnergyUsage(usage)
  }, [lights])

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, backgroundStyle]}>
        <StatusBar
          barStyle={isDarkMode ? "light-content" : "dark-content"}
          backgroundColor={backgroundStyle.backgroundColor}
        />
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={backgroundStyle}
          contentContainerStyle={styles.scrollContent}
        >
          {/* <Header /> */}

          <LightControls
            lights={lights}
            toggleLight={toggleLight}
            updateBrightness={updateBrightness}
            updateColor={updateColor}
            toggleAllLights={toggleAllLights}
          />

          <StatCards
            activeCount={lights.filter((light) => light.isOn).length}
            totalLights={lights.length}
            energyUsage={energyUsage}
            systemStatus={systemStatus}
            systemStatusDetail={systemStatusDetail}
          />
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
})
