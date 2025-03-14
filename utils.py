import streamlit as st

def initialize_session_state():
    """Inicializa las variables de estado de la sesión"""
    if 'logged_in' not in st.session_state:
        st.session_state.logged_in = False
    
    if 'username' not in st.session_state:
        st.session_state.username = None
