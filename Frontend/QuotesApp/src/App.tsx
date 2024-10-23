// src/App.tsx
import React from 'react';
import { useEffect } from 'react';
import { Quote, QuoteContext, QuoteTag, Tag } from './QuotesContext';
import { api_url } from './QuotesContext';
import QuoteList from './components/QuoteList';
import AddForm from './components/AddForm';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import styled from 'styled-components';

const Navbar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #333;
  padding: 10px 20px;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  box-sizing: border-box;
  max-width: 100%; /* Zabrání přesahu mimo viewport */
  overflow: hidden; /* Skryje přetékající prvky */
`;

const NavContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  max-width: 1200px; /* Zajišťuje maximální šířku obsahu */
  margin: 0 auto; /* Vycentruje obsah při širším zobrazení */
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const NavLinkItem = styled.li`
  margin-left: 20px;

  a {
    color: white;
    text-decoration: none;
    font-size: 18px;

    &:hover {
      color: #ff6347;
    }
  }
`;

const Brand = styled.div`
  font-size: 24px;
  color: white;
  font-weight: bold;
`;

const App: React.FC = () => {
    const { state, dispatch } = React.useContext(QuoteContext);

    const fetchQuotes = async () => {
        dispatch({ type: 'FETCH_QUOTES_REQUEST' }); // Zahájení načítání
        try {
            const response = await fetch(api_url+'/Quotes');
            if (!response.ok) {
            throw new Error('Failed to fetch quotes');
            }
            const data: Quote[] = await response.json();
            dispatch({ type: 'FETCH_QUOTES_SUCCESS', payload: data }); // Úspěšné načtení
        } catch (error) {
            dispatch({ type: 'FETCH_QUOTES_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' }); // Chyba
        }
    }
    
     const fetchQuoteTags = async () => {
        dispatch({ type: 'FETCH_QUOTETAGS_REQUEST' }); // Zahájení načítání
        try {
            const response = await fetch(api_url+'/QuoteTags');
            if (!response.ok) {
            throw new Error('Failed to fetch quoteTags');
            }
            const data: QuoteTag[] = await response.json();
            dispatch({ type: 'FETCH_QUOTETAGS_SUCCESS', payload: data }); // Úspěšné načtení
        } catch (error) {
            dispatch({ type: 'FETCH_QUOTETAGS_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' }); // Chyba
        }
    }
    
     const fetchTags = async () => {
        dispatch({ type: 'FETCH_TAGS_REQUEST' }); // Zahájení načítání
        try {
        const response = await fetch(api_url+'/Tags');
        if (!response.ok) {
            throw new Error('Failed to fetch tags');
        }
        const data: Tag[] = await response.json();
        dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: data }); // Úspěšné načtení
    } catch (error) {
        dispatch({ type: 'FETCH_TAGS_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' }); // Chyba
    }
    }
    useEffect(() => {
        fetchTags();
        fetchQuotes();
        fetchQuoteTags();
    }, []);
    return (
        <Router>
          {/* Navbar */}
          <Navbar>
            <NavContainer>
              <Brand>QuoteApp</Brand>
              <NavLinks>
                <NavLinkItem>
                  <Link to="/login">Login</Link>
                </NavLinkItem>
                <NavLinkItem>
                  <Link to="/register">Register</Link>
                </NavLinkItem>
                <NavLinkItem>
                  <Link to="/add-quote">Add Quote</Link>
                </NavLinkItem>
                <NavLinkItem>
                  <Link to="/quotes">Quote List</Link>
                </NavLinkItem>
              </NavLinks>
            </NavContainer>
          </Navbar>
    
          {/* Přidání paddingu pro obsah kvůli fixnímu navbaru */}
          <div style={{ paddingTop: '60px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/quotes" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/add-quote" element={<AddForm />} />
              <Route path="/quotes" element={<QuoteList />} />
            </Routes>
          </div>
        </Router>
      );
    };
export default App;