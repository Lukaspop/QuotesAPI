import React, { createContext, useReducer, PropsWithChildren } from "react";
export const api_url = "https://localhost:7126/api";

export type QuoteState = {
    isUserLoggedIn: boolean;
    isUserAdmin: boolean;
    userToken?: any;
    quotes: Quote[];
    tags: Tag[];
    quoteTags: QuoteTag[];
    loading: boolean;
    error: string | null;
    userName: string, // Přidáme userName

}; 
export type Quote = {
    tags: any;
    id: number;
    text: string;
}
export type Tag = {
    id: number;
    name: string;
}
export type QuoteTag = {
    quoteId: number;
    tagId: number;
}

export interface GameContextProps {
  state: QuoteState;
  dispatch: React.Dispatch<ReducerAction>;
}

const defaultState: QuoteState = {
    isUserLoggedIn: false,
    userToken: null,
    isUserAdmin: false,
    quotes: [],
    tags: [],
    quoteTags: [],
    loading: false,
    error: null,
    userName: '', 

};

type ReducerAction =
| { type: 'FETCH_TAGS_REQUEST' }
| { type: 'FETCH_TAGS_SUCCESS'; payload: Tag[] }
| { type: 'FETCH_TAGS_FAILURE'; payload: string}
| { type: 'FETCH_QUOTES_REQUEST' }
| { type: 'FETCH_QUOTES_SUCCESS'; payload: Quote[] }
| { type: 'FETCH_QUOTES_FAILURE'; payload: string }
| { type: 'FETCH_QUOTETAGS_REQUEST' }
| { type: 'FETCH_QUOTETAGS_SUCCESS'; payload: QuoteTag[] }
| { type: 'FETCH_QUOTETAGS_FAILURE'; payload: string}
| { type: 'LOGIN_SUCCESS'; payload: { isUserLoggedIn: boolean; isUserAdmin: boolean; email: string, token: any }}
| { type: 'LOGOUT_SUCCESS'; }

const quoteReducer = (state: QuoteState, action: ReducerAction): QuoteState => {
    switch (action.type) {
    case 'FETCH_TAGS_REQUEST':
        return {
          ...state,
          loading: true,
          error: null,
        };
    case 'FETCH_TAGS_SUCCESS':
        return {
          ...state,
          loading: false,
          tags: action.payload,
        };
    case 'FETCH_TAGS_FAILURE':
        return {
          ...state,
          loading: false,
          error: action.payload,
        };
    case 'FETCH_QUOTES_REQUEST':
        return {
          ...state,
          loading: true,
          error: null,
        };
    case 'FETCH_QUOTES_SUCCESS':
        return {
          ...state,
          loading: false,
          quotes: action.payload,
        };
    case 'FETCH_QUOTES_FAILURE':
        return {
          ...state,
          loading: false,
          error: action.payload 
        }
    case 'FETCH_QUOTETAGS_REQUEST':
        return {
            ...state,
            loading: true,
            error: null,
        };
    case 'FETCH_QUOTETAGS_SUCCESS':
        return {
            ...state,
            loading: false,
            quoteTags: action.payload,
        };
    case 'FETCH_QUOTETAGS_FAILURE':
        return {
            ...state,
            loading: false,
            error: action.payload 
        }
    
    
        case "LOGIN_SUCCESS":
          return {
            ...state,
            isUserLoggedIn: true,
            isUserAdmin: action.payload.isUserAdmin,
            userName: action.payload.email.toString(), // Ukládáme email po přihlášení
            userToken: action.payload.token
          };
        case "LOGOUT_SUCCESS":
          return {
            ...state,
            isUserLoggedIn: false,
            isUserAdmin: false,
            userName  : "", // Vymazání emailu po odhlášení
            userToken: null,
          };
    }
  }
export const QuoteContext = createContext<{
  state: QuoteState;
  dispatch: React.Dispatch<ReducerAction>;
}>({ state: defaultState, dispatch: () => {} });

export const QuoteProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(quoteReducer, defaultState);

  return (
    <QuoteContext.Provider value={{ state, dispatch }}>
      {children}
    </QuoteContext.Provider>
  );
}

