import pandas as pd
from datetime import datetime
import streamlit as st

class DataManager:
    def __init__(self):
        """Inicializa el gestor de datos con almacenamiento en memoria"""
        if 'users' not in st.session_state:
            st.session_state.users = {}
        if 'ejercicios' not in st.session_state:
            st.session_state.ejercicios = pd.DataFrame(
                columns=['username', 'fecha', 'ejercicio', 'series', 'repeticiones', 'peso'])
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

    def registrar_ejercicio(self, username, fecha, ejercicio, series, repeticiones, peso):
        """Registra un nuevo ejercicio"""
        nuevo_ejercicio = pd.DataFrame([{
            'username': username,
            'fecha': fecha,
            'ejercicio': ejercicio,
            'series': series,
            'repeticiones': repeticiones,
            'peso': peso
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
