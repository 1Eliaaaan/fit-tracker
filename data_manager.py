import pandas as pd
from datetime import datetime
import streamlit as st

EJERCICIOS_PREDEFINIDOS = [
    "Press Inclinado con Mancuernas",
    "Press plano en maquina",
    "Peck deck",
    "Elevaciones laterales en polea",
    "Elevaciones Laterales sentado con mancuerna",
    "Pajaros con mancuerna",
    "Press Frances",
    "Extension de Triceps en Polea Alta",
    "Dominadas",
    "Remo en polea",
    "Jalon al Pecho",
    "Pull Over en Polea",
    "Press Inclinado en maquina",
    "Press plano con mancuerna",
    "Cruces en polea",
    "Elevaciones laterales con mancuerna",
    "Extension de Triceps en Polea Baja",
    "Extension de Triceps en Polea Alta unilateral",
    "Sentadilla",
    "Sentadilla Hack en Maquina",
    "Bulgaras",
    "Extension de Cuadriceps",
    "Curl Femoral",
    "Aduptores",
    "Pantorrilla",
    "Abdominales con rueda",
    "Plancha Abdominal",
    "Encogimiento Abdominal"
]

class DataManager:
    def __init__(self):
        """Inicializa el gestor de datos con almacenamiento en memoria"""
        if 'users' not in st.session_state:
            st.session_state.users = {}
        if 'ejercicios' not in st.session_state:
            st.session_state.ejercicios = pd.DataFrame(
                columns=['username', 'fecha', 'ejercicio', 'series', 'repeticiones', 'pesos_por_serie'])
        if 'pesos' not in st.session_state:
            st.session_state.pesos = pd.DataFrame(
                columns=['username', 'fecha', 'peso'])

    def register_user(self, username, password):
        """Registra un nuevo usuario"""
        if username in st.session_state.users:
            return False
        st.session_state.users[username] = password
        return True

    def login_user(self, username, password):
        """Verifica las credenciales del usuario"""
        return username in st.session_state.users and st.session_state.users[username] == password

    def registrar_ejercicio(self, username, fecha, ejercicio, series, repeticiones, pesos_por_serie):
        """Registra un nuevo ejercicio con pesos diferentes por serie"""
        nuevo_ejercicio = pd.DataFrame([{
            'username': username,
            'fecha': fecha,
            'ejercicio': ejercicio,
            'series': series,
            'repeticiones': repeticiones,
            'pesos_por_serie': pesos_por_serie  # Lista de pesos, uno por cada serie
        }])
        st.session_state.ejercicios = pd.concat([st.session_state.ejercicios, nuevo_ejercicio], 
                                               ignore_index=True)

    def registrar_peso(self, username, fecha, peso):
        """Registra un nuevo peso corporal"""
        nuevo_peso = pd.DataFrame([{
            'username': username,
            'fecha': fecha,
            'peso': peso
        }])
        st.session_state.pesos = pd.concat([st.session_state.pesos, nuevo_peso], 
                                          ignore_index=True)

    def obtener_ejercicios(self, username):
        """Obtiene todos los ejercicios del usuario"""
        return st.session_state.ejercicios[st.session_state.ejercicios['username'] == username]

    def obtener_pesos(self, username):
        """Obtiene todos los registros de peso del usuario"""
        return st.session_state.pesos[st.session_state.pesos['username'] == username]