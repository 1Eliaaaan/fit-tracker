import streamlit as st
import pandas as pd
from datetime import datetime, date
import plotly.express as px
from data_manager import DataManager, EJERCICIOS_PREDEFINIDOS
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
                # Opción para seleccionar ejercicio predefinido o personalizado
                tipo_ejercicio = st.radio("Tipo de ejercicio", ["Predefinido", "Personalizado"])
                if tipo_ejercicio == "Predefinido":
                    ejercicio = st.selectbox("Selecciona el ejercicio", EJERCICIOS_PREDEFINIDOS)
                else:
                    ejercicio = st.text_input("Nombre del ejercicio personalizado")
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

                # Agregar botones de edición y eliminación
                for idx, row in ejercicios.iterrows():
                    with st.expander(f"{row['fecha'].strftime('%Y-%m-%d')} - {row['ejercicio']}"):
                        col1, col2, col3 = st.columns([2,1,1])

                        with col1:
                            st.write(f"Series: {row['series']}")
                            st.write(f"Repeticiones: {row['repeticiones']}")
                            st.write(f"Pesos: {', '.join([f'{peso}kg' for peso in row['pesos_por_serie']])}")

                        with col2:
                            if st.button("Editar", key=f"edit_{idx}"):
                                # Campos de edición
                                nueva_fecha = st.date_input("Nueva fecha", row['fecha'])
                                if row['ejercicio'] in EJERCICIOS_PREDEFINIDOS:
                                    nuevo_ejercicio = st.selectbox("Nuevo ejercicio", EJERCICIOS_PREDEFINIDOS, 
                                                                 index=EJERCICIOS_PREDEFINIDOS.index(row['ejercicio']))
                                else:
                                    nuevo_ejercicio = st.text_input("Nuevo ejercicio", row['ejercicio'])
                                nuevas_series = st.number_input("Nuevas series", min_value=1, value=row['series'])
                                nuevas_reps = st.number_input("Nuevas repeticiones", min_value=1, value=row['repeticiones'])

                                # Campos para nuevos pesos
                                nuevos_pesos = []
                                for i in range(nuevas_series):
                                    peso_actual = row['pesos_por_serie'][i] if i < len(row['pesos_por_serie']) else 0
                                    nuevo_peso = st.number_input(f"Nuevo peso serie {i+1}", 
                                                               min_value=0.0, 
                                                               value=float(peso_actual),
                                                               key=f"edit_peso_{idx}_{i}")
                                    nuevos_pesos.append(nuevo_peso)

                                if st.button("Guardar cambios", key=f"save_{idx}"):
                                    if data_manager.actualizar_ejercicio(idx, 
                                                                       st.session_state.username,
                                                                       nueva_fecha,
                                                                       nuevo_ejercicio,
                                                                       nuevas_series,
                                                                       nuevas_reps,
                                                                       nuevos_pesos):
                                        st.success("Ejercicio actualizado exitosamente")
                                        st.rerun()

                        with col3:
                            if st.button("Eliminar", key=f"delete_{idx}"):
                                if data_manager.eliminar_ejercicio(idx):
                                    st.success("Ejercicio eliminado exitosamente")
                                    st.rerun()

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
                # Mostrar los registros de peso con opciones de edición
                for idx, row in pesos.iterrows():
                    with st.expander(f"Peso registrado el {row['fecha'].strftime('%Y-%m-%d')}"):
                        col1, col2, col3 = st.columns([2,1,1])

                        with col1:
                            st.write(f"Peso: {row['peso']}kg")

                        with col2:
                            if st.button("Editar", key=f"edit_peso_{idx}"):
                                nueva_fecha = st.date_input("Nueva fecha", row['fecha'])
                                nuevo_peso = st.number_input("Nuevo peso", 
                                                           min_value=30.0, 
                                                           max_value=300.0, 
                                                           value=float(row['peso']))

                                if st.button("Guardar cambios", key=f"save_peso_{idx}"):
                                    if data_manager.actualizar_peso(idx,
                                                                  st.session_state.username,
                                                                  nueva_fecha,
                                                                  nuevo_peso):
                                        st.success("Peso actualizado exitosamente")
                                        st.rerun()

                        with col3:
                            if st.button("Eliminar", key=f"delete_peso_{idx}"):
                                if data_manager.eliminar_peso(idx):
                                    st.success("Peso eliminado exitosamente")
                                    st.rerun()

                # Gráfico de progreso de peso
                fig = px.line(pesos, x='fecha', y='peso',
                            title='Progreso de Peso Corporal')
                st.plotly_chart(fig)
            else:
                st.info("No hay registros de peso")

if __name__ == "__main__":
    main()