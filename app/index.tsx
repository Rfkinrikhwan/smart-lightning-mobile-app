import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter()

  const handleContinue = () => {
    router.navigate('/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.content}>
        <View style={styles.illustrationContainer}>
          {/* Cyan background shape */}
          <View style={styles.cyanBackground}>
            <Image
              source={require('../assets/images/HomeIndex.png')}
              style={styles.illustration}
            />
          </View>
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Smart Light Control</Text>
          <Text style={styles.title}>Made Simple</Text>
          <Text style={styles.subtitle}>
            Manage Your Home from Anywhere with Our Intuitive App
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: 20,
  },
  illustrationContainer: {
    flex: 1,
    marginBottom: 20,
  },
  cyanBackground: {
    width: '90%',
    height: 400,
    backgroundColor: '#ffffff',
    borderTopEndRadius: 150,
    borderEndEndRadius: 20,
    position: 'relative',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  textContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginTop: 10,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  continueButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  illustration: {
    width: '80%',
    height: '80%',
  },
});

export default WelcomeScreen;