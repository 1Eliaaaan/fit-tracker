import streamlit as st
import pandas as pd
from datetime import datetime, date
import plotly.express as px
from data_manager import DataManager
from utils import initialize_session_state

# Configuración inicial de la página
st.set_page_config(page_title="Fitness Tracker", layout="wide")

# Inicialización del estado de la sesión
initialize_session_state()

# Inicialización del gestor de datos
data_manager = DataManager()

def main():
    st.title("📊 Fitness Tracker")

    # Menú de autenticación
    if not st.session_state.logged_in:
        col1, col2 = st.columns(2)

        with col1:
            st.header("Iniciar Sesión")
            username = st.text_input("Usuario", key="login_username")
            password = st.text_input("Contraseña", type="password", key="login_password")
            if st.button("Iniciar Sesión"):
                if data_manager.login_user(username, password):
                    st.session_state.logged_in = True
                    st.session_state.username = username
                    st.rerun()
                else:
                    st.error("Usuario o contraseña incorrectos")

        with col2:
            st.header("Registrarse")
            new_username = st.text_input("Usuario", key="register_username")
            new_password = st.text_input("Contraseña", type="password", key="register_password")
            if st.button("Registrarse"):
                if data_manager.register_user(new_username, new_password):
                    st.success("Usuario registrado exitosamente")
                else:
                    st.error("El usuario ya existe")

    else:
        st.sidebar.title(f"Bienvenido, {st.session_state.username}")
        if st.sidebar.button("Cerrar Sesión"):
            st.session_state.logged_in = False
            st.rerun()

        # Menú principal
        menu = st.sidebar.selectbox(
            "Menú",
            ["Registrar Ejercicio", "Registrar Peso", "Ver Histórico", "Ver Progreso de Peso"]
        )

        if menu == "Registrar Ejercicio":
            st.header("Registrar Ejercicio")

            col1, col2 = st.columns(2)
            with col1:
                fecha = st.date_input("Fecha", date.today())
                ejercicio = st.text_input("Nombre del Ejercicio")
                series = st.number_input("Número de Series", min_value=1, value=3)

            with col2:
                repeticiones = st.number_input("Repeticiones por Serie", min_value=1, value=12)

            # Crear campos dinámicos para los pesos de cada serie
            st.subheader("Pesos por Serie (kg)")
            pesos_por_serie = []
            cols = st.columns(min(4, series))  # Máximo 4 columnas
            for i in range(series):
                col_idx = i % 4
                with cols[col_idx]:
                    peso = st.number_input(f"Peso Serie {i+1}", 
                                         min_value=0.0, 
                                         value=10.0, 
                                         key=f"peso_serie_{i}")
                    pesos_por_serie.append(peso)

            if st.button("Guardar Ejercicio"):
                data_manager.registrar_ejercicio(
                    st.session_state.username,
                    fecha,
                    ejercicio,
                    series,
                    repeticiones,
                    pesos_por_serie
                )
                st.success("Ejercicio registrado exitosamente")

        elif menu == "Registrar Peso":
            st.header("Registrar Peso Corporal")

            fecha = st.date_input("Fecha", date.today())
            peso = st.number_input("Peso (kg)", min_value=30.0, max_value=300.0, value=70.0)

            if st.button("Guardar Peso"):
                data_manager.registrar_peso(
                    st.session_state.username,
                    fecha,
                    peso
                )
                st.success("Peso registrado exitosamente")

        elif menu == "Ver Histórico":
            st.header("Histórico de Ejercicios")

            ejercicios = data_manager.obtener_ejercicios(st.session_state.username)
            if not ejercicios.empty:
                # Mostrar los pesos por serie en formato legible
                ejercicios_display = ejercicios.copy()
                ejercicios_display['pesos_por_serie'] = ejercicios_display['pesos_por_serie'].apply(
                    lambda x: ', '.join([f'{peso}kg' for peso in x])
                )
                st.dataframe(ejercicios_display)

                # Gráfico de progreso por ejercicio
                ejercicio_seleccionado = st.selectbox(
                    "Selecciona un ejercicio para ver su progreso",
                    ejercicios['ejercicio'].unique()
                )

                datos_ejercicio = ejercicios[ejercicios['ejercicio'] == ejercicio_seleccionado]
                # Calcular el peso promedio por día para el gráfico
                datos_ejercicio['peso_promedio'] = datos_ejercicio['pesos_por_serie'].apply(
                    lambda x: sum(x) / len(x) if len(x)>0 else 0
                )
                fig = px.line(datos_ejercicio, x='fecha', y='peso_promedio',
                            title=f'Progreso de peso promedio en {ejercicio_seleccionado}')
                st.plotly_chart(fig)
            else:
                st.info("No hay ejercicios registrados")

        elif menu == "Ver Progreso de Peso":
            st.header("Progreso de Peso Corporal")

            pesos = data_manager.obtener_pesos(st.session_state.username)
            if not pesos.empty:
                fig = px.line(pesos, x='fecha', y='peso',
                            title='Progreso de Peso Corporal')
                st.plotly_chart(fig)
                st.dataframe(pesos)
            else:
                st.info("No hay registros de peso")

if __name__ == "__main__":
    main()