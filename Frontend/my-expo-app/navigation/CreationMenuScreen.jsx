import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';
// import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const CreationMenuScreen = ({ navigation }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  const navigateTo = (screen) => {
    // Close first then navigate
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
        navigation.goBack(); // Close modal
        // We need to navigate from the parent context logic or just replace
        // Since we goBack(), we are back at the Tab. 
        // We need to pass a param or navigation event, but standard navigate works if the screen is in the stack.
        navigation.navigate(screen); 
    });
  };

  return (
    <View className="flex-1 justify-end">
        <TouchableWithoutFeedback onPress={closeMenu}>
            <Animated.View 
                style={{ opacity: fadeAnim }}
                className="absolute top-0 bottom-0 left-0 right-0 bg-black/40"
            />
        </TouchableWithoutFeedback>

      <Animated.View
        style={{
          transform: [{ translateY: slideAnim }],
        }}
        className="w-full rounded-t-3xl bg-white pb-10 pt-6 px-6 shadow-2xl"
      >
        <View className="mb-2 items-center">
            <View className="h-1.5 w-12 rounded-full bg-gray-300 mb-4" />
            <Text className="text-xl font-bold text-gray-800">¿Qué quieres crear?</Text>
        </View>

        <View className="flex-row justify-around mt-6">
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigateTo('CreateConfession')}
                className="items-center"
            >
                <LinearGradient
                    colors={['#8B5CF6', '#6D28D9']}
                    className="h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-purple-300"
                >
                    <Feather name="message-circle" size={30} color="white" />
                </LinearGradient>
                <Text className="mt-2 text-sm font-medium text-gray-700">Confesión</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => navigateTo('CreateEvent')}
                className="items-center"
            >
                <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                    className="h-16 w-16 items-center justify-center rounded-2xl shadow-lg shadow-pink-300"
                >
                    <Feather name="calendar" size={30} color="white" />
                </LinearGradient>
                <Text className="mt-2 text-sm font-medium text-gray-700">Evento</Text>
            </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
            onPress={closeMenu}
            className="mt-8 items-center justify-center rounded-xl bg-gray-100 py-3"
        >
            <Text className="font-bold text-gray-600">Cancelar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default CreationMenuScreen;
