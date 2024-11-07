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
          background-color: #a6a6a6;
          color: white;
        `
      : css`
          color: white;
        `}
`;

const Input = styled.input`
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #444;
  border-radius: 4px;
  background-color: #2a2a2a;
  color: #ffffff;

  &::placeholder {
    color: #aaa;
  }
`;

const QuoteList: React.FC = () => {
  const { state, dispatch } = useContext(QuoteContext);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showMyQuotes, setShowMyQuotes] = useState(false);
  const [randomQuote, setRandomQuote] = useState<Quote | null>(null);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null); // Stav pro upravovaný citát

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
      dispatch({
        type: 'FETCH_QUOTES_FAILURE',
        payload: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const fetchMyQuotes = async () => {
    dispatch({ type: 'FETCH_QUOTES_REQUEST' });
    try {
      const response = await fetch(`${api_url}/Quotes/me`, {
        headers: {
          Authorization: `Bearer ${state.userToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch my quotes');
      }
      const data: Quote[] = await response.json();
      dispatch({ type: 'FETCH_QUOTES_SUCCESS', payload: data });
    } catch (error) {
      dispatch({
        type: 'FETCH_QUOTES_FAILURE',
        payload: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const updateQuote = async (quote: Quote) => {
    try {
      const response = await fetch(`${api_url}/Quotes/${quote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.userToken}`,
        },
        body: JSON.stringify(quote),
      });

      if (!response.ok) {
        throw new Error('Failed to update quote');
      }

      fetchMyQuotes(); // Znovu načteme uživatelovy citáty
      setEditingQuote(null); // Reset editace
    } catch (error) {
      console.error('Error updating quote:', error);
    }
  };

  const deleteQuote = async (id: number) => {
    try {
      const response = await fetch(`${api_url}/Quotes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${state.userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete quote');
      }

      fetchMyQuotes(); // Znovu načteme citáty uživatele
    } catch (error) {
      console.error('Error deleting quote:', error);
    }
  };

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error: {state.error}</div>;
  }

  const isLoggedIn = !!state.userToken;

  const quotesWithTags = state.quotes.map((quote) => {
    const relatedTags = state.quoteTags
      .filter((qt) => qt.quoteId === quote.id)
      .map((qt) => state.tags.find((tag) => tag.id === qt.tagId))
      .filter((tag): tag is Tag => tag !== undefined);

    return { ...quote, tags: relatedTags };
  });

  const filteredQuotes = selectedTag
    ? quotesWithTags.filter((quote) =>
        quote.tags.some((tag) => tag.id === selectedTag.id)
      )
    : quotesWithTags;

  const getRandomQuote = () => {
    if (filteredQuotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      setRandomQuote(filteredQuotes[randomIndex]);
    }
  };

  const resetRandomQuote = () => {
    setRandomQuote(null);
  };

  return (
    <div>
      <h1>QuoteList</h1>

      <div>{isLoggedIn ? <p>You are logged in.</p> : <p>You are not logged in.</p>}</div>

      <Button active={showMyQuotes} onClick={() => setShowMyQuotes(!showMyQuotes)}>
        {showMyQuotes ? 'Show All Quotes' : 'Show My Quotes'}
      </Button>

      <Button onClick={getRandomQuote}>Random Quote</Button>
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
          <div style={{ marginBottom: '20px' }}>
            <Button active={selectedTag === null} onClick={() => setSelectedTag(null)}>
              All Quotes
            </Button>
            {state.tags.map((tag) => (
              <Button
                key={tag.id}
                active={selectedTag?.id === tag.id}
                onClick={() => setSelectedTag(tag)}
                style={{ marginLeft: '10px' }}
              >
                {tag.name}
              </Button>
            ))}
          </div>

          <ul>
            {filteredQuotes.map((quote) => (
              <li key={quote.id}>
                {editingQuote?.id === quote.id ? (
                  <>
                    <Input
                      type="text"
                      value={editingQuote.text}
                      onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                    />
                    <Button onClick={() => updateQuote(editingQuote)}>Save</Button>
                    <Button onClick={() => setEditingQuote(null)}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <p>"{quote.text}"</p>
                    <p>Tags: {quote.tags.map((tag) => tag.name).join(', ')}</p>
                    {isLoggedIn && showMyQuotes && (
                      <>
                        <Button onClick={() => setEditingQuote(quote)}>Edit</Button>
                        <Button onClick={() => deleteQuote(quote.id)} style={{ marginLeft: '10px' }}>
                          Delete
                        </Button>
                      </>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default QuoteList;
