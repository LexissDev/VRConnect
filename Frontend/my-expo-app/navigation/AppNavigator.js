import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import useAuthStore from '../stores/authStore';

// Pantallas de autenticación
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Pantallas principales
import HomeScreen from '../screens/home/HomeScreen';
import WorldsScreen from '../screens/worlds/WorldsScreen';
import ConfessionsScreen from '../screens/confessions/ConfessionsScreen';
import EventsScreen from '../screens/events/EventsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import CreateConfession from 'screens/confessions/CreateConfession';
import VRChatLoginScreen from 'screens/profile/VRChatLoginScreen';
import WorldDetailScreen from 'screens/worlds/WorldDetailScreen';
import ProfileSetupScreen from 'screens/auth/ProfileSetupScreen';
import VRChatLinkPromptScreen from 'screens/auth/VRChatLinkPromptScreen';
import { getCurrentUser } from 'services/vrchat';
import ConfessionDetailScreen from 'screens/confessions/ConfessionDetailScreen';


// Importar las nuevas pantallas
import CreateEventScreen from 'screens/events/CreateEventScreen';
import EventDetailScreen from 'screens/events/EventDetailScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navegador de pestañas principal
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333333',
          height: 60,
          paddingBottom: 10,
        },
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Worlds"
        component={WorldsScreen}
        options={{
          tabBarLabel: 'Mundos',
          tabBarIcon: ({ color, size }) => <Feather name="globe" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Confessions"
        component={ConfessionsScreen}
        options={{
          tabBarLabel: 'Confesiones',
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: ({ color, size }) => <Feather name="calendar" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Navegador principal de la aplicación
const AppNavigator = () => {
  const { user, checkSession, loading, setIsVrchatUser } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const UserVrchat = async () => {
      const response = await getCurrentUser();
      if (user && !response.error) {
        setIsVrchatUser(true);
      }
    };
    UserVrchat();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#aaa]">
        <Text className="text-lg text-white">Cargando...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#121212',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#121212',
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

            <Stack.Screen
              name="VRChatLinkPrompt"
              component={VRChatLinkPromptScreen}
              options={{ headerShown: false }}
            />

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
              name="VRChatLogin"
              component={VRChatLoginScreen}
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
          </>
          /*
          <>
           
            <Stack.Screen
              name="WorldDetail"
              component={WorldDetailScreen}
              options={{ title: 'Detalles del Mundo' }}
            />
            <Stack.Screen
              name="EventDetail"
              component={EventDetailScreen}
              options={{ title: 'Detalles del Evento' }}
            />
            <Stack.Screen
              name="ConfessionDetail"
              component={ConfessionDetailScreen}
              options={{ title: 'Confesión' }}
            />
            <Stack.Screen
              name="CreateEvent"
              component={CreateEventScreen}
              options={{ title: 'Crear Evento' }}
            />
            <Stack.Screen
              name="CreateConfession"
              component={CreateConfessionScreen}
              options={{ title: 'Nueva Confesión' }}
            />
          </>
          */
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
