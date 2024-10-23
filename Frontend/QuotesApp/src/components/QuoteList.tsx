import React, { useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { QuoteContext, Quote, Tag } from '../QuotesContext';
import { api_url } from '../QuotesContext';

// Styled Components
const Button = styled.button<{ active?: boolean }>`
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background-color 0.3s;

  ${(props) =>
    props.active
      ? css`
          background-color: #a6a6a6; /* Zelená pro aktivní */
          color: white;
        `
      : css`
          color: white;
        `}
`;

const QuoteList: React.FC = () => {
  const { state, dispatch } = useContext(QuoteContext);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null); // Stav pro aktuálně vybraný tag
  const [showMyQuotes, setShowMyQuotes] = useState(false); // Stav pro zobrazení citátů uživatele
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null); // Stav pro náhodný citát

  useEffect(() => {
    if (showMyQuotes) {
      fetchMyQuotes();
    } else {
      fetchAllQuotes();
    }
  }, [showMyQuotes]);

  const fetchAllQuotes = async () => {
    dispatch({ type: 'FETCH_QUOTES_REQUEST' });
    try {
      const response = await fetch(`${api_url}/Quotes`);
      if (!response.ok) {
        throw new Error('Failed to fetch quotes');
      }
      const data: Quote[] = await response.json();
      dispatch({ type: 'FETCH_QUOTES_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_QUOTES_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  const fetchMyQuotes = async () => {
    dispatch({ type: 'FETCH_QUOTES_REQUEST' });
    try {
      const response = await fetch(`${api_url}/Quotes/me`, {
        headers: {
          Authorization: `Bearer ${state.userToken}` // Přidání tokenu pro autorizaci
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch my quotes');
      }
      const data: Quote[] = await response.json();
      dispatch({ type: 'FETCH_QUOTES_SUCCESS', payload: data });
    } catch (error) {
      dispatch({ type: 'FETCH_QUOTES_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' });
    }
  };

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error}</div>;
  }

  // Zobrazit, zda je uživatel přihlášený
  const isLoggedIn = !!state.userToken; // Zkontroluje, zda je token k dispozici

  // Spojení tagů a citátů
  const quotesWithTags = state.quotes.map((quote) => {
    const relatedTags = state.quoteTags
      .filter((qt) => qt.quoteId === quote.id)
      .map((qt) => state.tags.find((tag) => tag.id === qt.tagId))
      .filter((tag): tag is Tag => tag !== undefined); // Ochrana typu

    return { ...quote, tags: relatedTags };
  });

  // Filtruj citáty podle vybraného tagu
  const filteredQuotes = selectedTag
    ? quotesWithTags.filter((quote) => quote.tags.some((tag) => tag.id === selectedTag.id))
    : quotesWithTags;

  // Funkce pro získání náhodného citátu
  const getRandomQuote = () => {
    if (filteredQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      setRandomQuote(filteredQuotes[randomIndex]);
    }
  };

  // Resetování náhodného citátu
  const resetRandomQuote = () => {
    setRandomQuote(null);
  };

  return (
    <div>
      <h1>QuoteList</h1>

      {/* Zobrazit stav přihlášení */}
      <div>
        {isLoggedIn ? <p>You are logged in.</p> : <p>You are not logged in.</p>}
      </div>

      {/* Tlačítko pro zobrazení pouze citátů uživatele */}
      <Button active={showMyQuotes} onClick={() => setShowMyQuotes(!showMyQuotes)}>
        {showMyQuotes ? 'Show All Quotes' : 'Show My Quotes'}
      </Button>

      {/* Tlačítko pro zobrazení náhodného citátu */}
      <Button onClick={getRandomQuote}>
        Random Quote
      </Button>
      <Button onClick={resetRandomQuote} style={{ marginLeft: '10px' }}>
        Back to List
      </Button>

      {randomQuote ? (
        <div>
          <h2>Random Quote</h2>
          <p>"{randomQuote.text}"</p>
          <p>Tags: {randomQuote.tags.map((tag: Tag) => tag.name).join(', ')}</p>
        </div>
      ) : (
        <>
          {/* Tlačítka pro filtrování tagů */}
          <div style={{ marginBottom: '20px' }}>
            <Button active={selectedTag === null} onClick={() => setSelectedTag(null)}>All Quotes</Button>
            {state.tags.map((tag) => (
              <Button key={tag.id} active={selectedTag?.id === tag.id} onClick={() => setSelectedTag(tag)} style={{ marginLeft: '10px' }}>
                {tag.name}
              </Button>
            ))}
          </div>

          <ul>
            {filteredQuotes.map((quote) => (
              <li key={quote.id}>
                <p>"{quote.text}"</p>
                <p>Tags: {quote.tags.map((tag) => tag.name).join(', ')}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default QuoteList;
