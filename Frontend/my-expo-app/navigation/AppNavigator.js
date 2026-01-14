import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import useAuthStore from '../stores/authStore';

// Pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

// Pantallas principales
import HomeScreen from '../screens/home/HomeScreen';
import WorldsScreen from '../screens/worlds/WorldsScreen';
import ConfessionsScreen from '../screens/confessions/ConfessionsScreen';
import EventsScreen from '../screens/events/EventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen'; // Accessed via header now

import CreateConfession from 'screens/confessions/CreateConfession';
import CreateEventScreen from 'screens/events/CreateEventScreen';
import EventDetailScreen from 'screens/events/EventDetailScreen';
import ConfessionDetailScreen from 'screens/confessions/ConfessionDetailScreen';
import WorldDetailScreen from '../screens/worlds/WorldDetailScreen';
import CreationMenuScreen from './CreationMenuScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Button for the Middle Tab
const CustomTabBarButton = ({ children, onPress }) => (
  <TouchableOpacity
    style={{
      top: -20,
      justifyContent: 'center',
      alignItems: 'center',
    }}
    onPress={onPress}
  >
    <LinearGradient
        colors={['#8B5CF6', '#6D28D9']}
        style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center'
        }}
    >
      {children}
    </LinearGradient>
  </TouchableOpacity>
);

// Navegador de pestañas principal
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#F3F4F6',
          height: 70, // Slightly taller
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600'
        }
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'INICIO',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={24} />,
        }}
      />
      <Tab.Screen
        name="Worlds"
        component={WorldsScreen}
        options={{
          tabBarLabel: 'MUNDOS',
          tabBarIcon: ({ color, size }) => <Feather name="globe" color={color} size={24} />,
        }}
      />
      
      {/* Middle Button - Opens Creation Menu */}
      <Tab.Screen
        name="Create"
        component={View} // Dummy component
        options={({ navigation }) => ({
            tabBarButton: (props) => (
                <CustomTabBarButton {...props} onPress={() => navigation.navigate('CreationMenu')}>
                    <Feather name="plus" size={30} color="#FFF" />
                </CustomTabBarButton>
            ),
            tabBarLabel: '',
        })}
        listeners={({ navigation }) => ({
            tabPress: (e) => {
              e.preventDefault();
              navigation.navigate('CreationMenu');
            },
        })}
      />

      <Tab.Screen
        name="Confessions"
        component={ConfessionsScreen}
        options={{
          tabBarLabel: 'CONFESIONES',
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'EVENTOS',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal de la aplicación
const AppNavigator = () => {
  const { user, checkSession, loading } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFFFFF]">
        <Text className="text-lg text-purple-600">Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#1F2937',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#F9FAFB', // Light gray background
          },
        }}>
        {!user ? (
          // Rutas de autenticación
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen
              name="ProfileSetup"
              component={ProfileSetupScreen}
              options={{ headerShown: false }}
            />
          </Stack.Group>
        ) : (
          // Rutas principales
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            
            {/* Modal Group */}
             <Stack.Group screenOptions={{ presentation: 'transparentModal', headerShown: false, animation: 'fade' }}>
                <Stack.Screen name="CreationMenu" component={CreationMenuScreen} />
             </Stack.Group>

            <Stack.Group>
                <Stack.Screen
                name="CreateConfession"
                component={CreateConfession}
                options={{ headerShown: false }}
                />
                <Stack.Screen
                name="CreateEvent"
                component={CreateEventScreen}
                options={{ headerShown: false }}
                />

                <Stack.Screen
                name="EventDetail"
                component={EventDetailScreen}
                options={{ headerShown: false }}
                />

                <Stack.Screen
                name="WorldDetail"
                component={WorldDetailScreen}
                options={{ headerShown: false }}
                />
                <Stack.Screen
                name="ConfessionDetail"
                component={ConfessionDetailScreen}
                options={{ headerShown: false }}
                />
                <Stack.Screen 
                 name="Profile" 
                 component={ProfileScreen} 
                 // Allow going back from profile to home
                />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
