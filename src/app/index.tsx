import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function App(){
  return (
    <View style={styles.container}>
      <StatusBar style="light"/>

      <View style={styles.circleContainer}>
        <View style={styles.circle}>
          <Text style={styles.circleRatingText}>80</Text>
          <Text style={styles.circleText}>Driver Rating</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={({pressed}) => [styles.button, pressed && styles.buttonPressed]} onPress={() => console.log("Start Button Pressed!")}>
          <Text style={styles.buttonText}>Start</Text>
        </Pressable>
        <Pressable style={({pressed}) => [styles.button, pressed && styles.buttonPressed]} onPress={() => console.log("Stop button pressed!")}>
          <Text style={styles.buttonText}>Stop</Text>
        </Pressable>
      </View>


      </View>
  )
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
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%'
  },
  button: {
    backgroundColor: '#27B4F5',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  buttonPressed:{
    backgroundColor: '#055E70'
  },
  buttonText: {
    color: "white"
  }
})