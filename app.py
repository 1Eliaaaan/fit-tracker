import streamlit as st
import pandas as pd
from datetime import datetime, date
import plotly.express as px
from data_manager import DataManager, EJERCICIOS_PREDEFINIDOS
from utils import initialize_session_state

# Configuración inicial de la página
st.set_page_config(
    page_title="Fitness Tracker",
    page_icon="💪",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Inicialización del estado de la sesión
initialize_session_state()

# Inicialización del gestor de datos
data_manager = DataManager()

def main():
    # Estilo CSS personalizado
    st.markdown("""
        <style>
        .main {
            padding: 2rem;
        }
        .stButton>button {
            width: 100%;
        }
        .reportview-container {
            margin-top: -2rem;
        }
        .css-1d391kg {
            padding: 1rem;
        }
        .stSelectbox [data-baseweb=select] {
            margin-top: 0rem;
        }
        </style>
    """, unsafe_allow_html=True)

    # Inicializar tema si no existe
    if 'theme' not in st.session_state:
        st.session_state.theme = 'light'

    if not st.session_state.logged_in:
        st.title("Fitness Tracker")
        st.markdown("### Tu compañero personal para seguir tu progreso")

        # Selector de tema
        theme = st.sidebar.radio(
            "Tema",
            ["Modo Claro", "Modo Oscuro"],
            index=0 if st.session_state.theme == 'light' else 1
        )
        st.session_state.theme = 'light' if "Claro" in theme else 'dark'

        col1, col2 = st.columns(2)

        with col1:
            st.markdown("### Iniciar Sesión")
            with st.container():
                username = st.text_input("Usuario", key="login_username")
                password = st.text_input("Contraseña", type="password", key="login_password")
                if st.button("Iniciar Sesión", type="primary"):
                    if data_manager.login_user(username, password):
                        st.session_state.logged_in = True
                        st.session_state.username = username
                        st.rerun()
                    else:
                        st.error("Usuario o contraseña incorrectos")

        with col2:
            st.markdown("### Registrarse")
            with st.container():
                new_username = st.text_input("Usuario", key="register_username")
                new_password = st.text_input("Contraseña", type="password", key="register_password")
                if st.button("Crear Cuenta", type="primary"):
                    if data_manager.register_user(new_username, new_password):
                        st.success("Usuario registrado exitosamente")
                    else:
                        st.error("El usuario ya existe")

    else:
        # Sidebar con información del usuario y navegación
        with st.sidebar:
            st.title(f"Hola, {st.session_state.username}")
            st.markdown("---")

            # Selector de tema
            theme = st.radio(
                "Tema",
                ["Modo Claro", "Modo Oscuro"],
                index=0 if st.session_state.theme == 'light' else 1
            )
            st.session_state.theme = 'light' if "Claro" in theme else 'dark'

            st.markdown("---")
            menu = st.selectbox(
                "Menú",
                ["Registrar Ejercicio", "Registrar Peso", "Ver Histórico", "Ver Progreso de Peso"]
            )
            st.markdown("---")
            if st.button("Cerrar Sesión"):
                st.session_state.logged_in = False
                st.rerun()

        if "Registrar Ejercicio" in menu:
            st.title("Registrar Ejercicio")
            st.markdown("#### Registra tu entrenamiento de hoy")

            col1, col2 = st.columns(2)
            with col1:
                fecha = st.date_input("Fecha", date.today())
                tipo_ejercicio = st.radio("Tipo de ejercicio", ["Predefinido", "Personalizado"])
                if tipo_ejercicio == "Predefinido":
                    ejercicio = st.selectbox("Selecciona el ejercicio", EJERCICIOS_PREDEFINIDOS)
                else:
                    ejercicio = st.text_input("Nombre del ejercicio personalizado")
                series = st.number_input("Número de Series", min_value=1, value=3)

            with col2:
                repeticiones = st.number_input("Repeticiones por Serie", min_value=1, value=12)

            st.markdown("#### Pesos por Serie (kg)")
            pesos_por_serie = []
            cols = st.columns(min(4, series))
            for i in range(series):
                col_idx = i % 4
                with cols[col_idx]:
                    peso = st.number_input(
                        f"Serie {i+1}", 
                        min_value=0.0, 
                        value=10.0, 
                        key=f"peso_serie_{i}",
                        help=f"Ingresa el peso para la serie {i+1}"
                    )
                    pesos_por_serie.append(peso)

            if st.button("Guardar Ejercicio", type="primary"):
                data_manager.registrar_ejercicio(
                    st.session_state.username,
                    fecha,
                    ejercicio,
                    series,
                    repeticiones,
                    pesos_por_serie
                )
                st.success("Ejercicio registrado exitosamente")

        elif "Registrar Peso" in menu:
            st.title("Registrar Peso Corporal")
            st.markdown("#### Mantén un registro de tu peso")

            col1, col2 = st.columns(2)
            with col1:
                fecha = st.date_input("Fecha", date.today())
            with col2:
                peso = st.number_input(
                    "Peso (kg)",
                    min_value=30.0,
                    max_value=300.0,
                    value=70.0,
                    help="Ingresa tu peso corporal en kilogramos"
                )

            if st.button("Guardar Peso", type="primary"):
                data_manager.registrar_peso(
                    st.session_state.username,
                    fecha,
                    peso
                )
                st.success("Peso registrado exitosamente")

        elif "Ver Histórico" in menu:
            st.title("Histórico de Ejercicios")
            st.markdown("#### Revisa y edita tus ejercicios registrados")

            ejercicios = data_manager.obtener_ejercicios(st.session_state.username)
            if not ejercicios.empty:
                for idx, row in ejercicios.iterrows():
                    with st.expander(f"{row['fecha'].strftime('%d/%m/%Y')} - {row['ejercicio']}"):
                        col1, col2, col3 = st.columns([2,1,1])

                        with col1:
                            st.markdown(f"**Series:** {row['series']}")
                            st.markdown(f"**Repeticiones:** {row['repeticiones']}")
                            st.markdown("**Pesos por serie:**")
                            st.markdown(", ".join([f"Serie {i+1}: {peso}kg" for i, peso in enumerate(row['pesos_por_serie'])]))

                        with col2:
                            if st.button("Editar", key=f"edit_{idx}"):
                                st.markdown("#### Editar ejercicio")
                                nueva_fecha = st.date_input("Fecha", row['fecha'])
                                if row['ejercicio'] in EJERCICIOS_PREDEFINIDOS:
                                    nuevo_ejercicio = st.selectbox(
                                        "Ejercicio",
                                        EJERCICIOS_PREDEFINIDOS,
                                        index=EJERCICIOS_PREDEFINIDOS.index(row['ejercicio'])
                                    )
                                else:
                                    nuevo_ejercicio = st.text_input("Ejercicio", row['ejercicio'])

                                nuevas_series = st.number_input("Series", min_value=1, value=row['series'])
                                nuevas_reps = st.number_input("Repeticiones", min_value=1, value=row['repeticiones'])

                                st.markdown("#### Pesos por serie")
                                nuevos_pesos = []
                                cols = st.columns(min(4, nuevas_series))
                                for i in range(nuevas_series):
                                    col_idx = i % 4
                                    with cols[col_idx]:
                                        peso_actual = row['pesos_por_serie'][i] if i < len(row['pesos_por_serie']) else 0
                                        nuevo_peso = st.number_input(
                                            f"Serie {i+1}",
                                            min_value=0.0,
                                            value=float(peso_actual),
                                            key=f"edit_peso_{idx}_{i}"
                                        )
                                        nuevos_pesos.append(nuevo_peso)

                                if st.button("Guardar cambios", key=f"save_{idx}", type="primary"):
                                    if data_manager.actualizar_ejercicio(
                                        idx,
                                        st.session_state.username,
                                        nueva_fecha,
                                        nuevo_ejercicio,
                                        nuevas_series,
                                        nuevas_reps,
                                        nuevos_pesos
                                    ):
                                        st.success("Ejercicio actualizado exitosamente")
                                        st.rerun()

                        with col3:
                            if st.button("Eliminar", key=f"delete_{idx}", type="secondary"):
                                if data_manager.eliminar_ejercicio(idx):
                                    st.success("Ejercicio eliminado exitosamente")
                                    st.rerun()

                st.markdown("---")
                st.markdown("### Gráfico de Progreso")
                ejercicio_seleccionado = st.selectbox(
                    "Selecciona un ejercicio para ver su progreso",
                    ejercicios['ejercicio'].unique()
                )

                datos_ejercicio = ejercicios[ejercicios['ejercicio'] == ejercicio_seleccionado]
                datos_ejercicio['peso_promedio'] = datos_ejercicio['pesos_por_serie'].apply(
                    lambda x: sum(x) / len(x) if len(x)>0 else 0
                )

                fig = px.line(
                    datos_ejercicio,
                    x='fecha',
                    y='peso_promedio',
                    title=f'Progreso de peso promedio en {ejercicio_seleccionado}'
                )
                fig.update_layout(
                    xaxis_title="Fecha",
                    yaxis_title="Peso promedio (kg)",
                    showlegend=False
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No hay ejercicios registrados")

        elif "Ver Progreso de Peso" in menu:
            st.title("Progreso de Peso Corporal")
            st.markdown("#### Seguimiento de tu peso corporal")

            pesos = data_manager.obtener_pesos(st.session_state.username)
            if not pesos.empty:
                for idx, row in pesos.iterrows():
                    with st.expander(f"Peso registrado el {row['fecha'].strftime('%d/%m/%Y')}"):
                        col1, col2, col3 = st.columns([2,1,1])

                        with col1:
                            st.markdown(f"**Peso:** {row['peso']}kg")

                        with col2:
                            if st.button("Editar", key=f"edit_peso_{idx}"):
                                st.markdown("#### Editar registro de peso")
                                nueva_fecha = st.date_input("Fecha", row['fecha'])
                                nuevo_peso = st.number_input(
                                    "Peso",
                                    min_value=30.0,
                                    max_value=300.0,
                                    value=float(row['peso'])
                                )

                                if st.button("Guardar cambios", key=f"save_peso_{idx}", type="primary"):
                                    if data_manager.actualizar_peso(
                                        idx,
                                        st.session_state.username,
                                        nueva_fecha,
                                        nuevo_peso
                                    ):
                                        st.success("Peso actualizado exitosamente")
                                        st.rerun()

                        with col3:
                            if st.button("Eliminar", key=f"delete_peso_{idx}", type="secondary"):
                                if data_manager.eliminar_peso(idx):
                                    st.success("Peso eliminado exitosamente")
                                    st.rerun()

                st.markdown("---")
                st.markdown("### Gráfico de Progreso")
                fig = px.line(
                    pesos,
                    x='fecha',
                    y='peso',
                    title='Progreso de Peso Corporal'
                )
                fig.update_layout(
                    xaxis_title="Fecha",
                    yaxis_title="Peso (kg)",
                    showlegend=False
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No hay registros de peso")

if __name__ == "__main__":
    main()