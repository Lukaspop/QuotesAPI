import React, { useContext, useState } from 'react';
import Select from 'react-select';
import styled from 'styled-components';
import { QuoteContext, api_url } from '../QuotesContext'; // Uprav cestu podle potřeby
import { Tag } from '../QuotesContext'; // Uprav cestu podle potřeby
import { Quote } from '../QuotesContext'; // Uprav cestu podle potřeby
import { QuoteTag } from '../QuotesContext'; // Uprav cestu podle potřeby

const FormContainer = styled.div`
    background-color: #1f1f1f; // Tmavší pozadí pro dark mode
    color: #ffffff; // Bílý text
    padding: 20px;
    border-radius: 8px;
`;

const Input = styled.input`
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #444;
    border-radius: 4px;
    background-color: #2a2a2a; // Tmavší pozadí
    color: #ffffff; // Bílý text
    
    &::placeholder {
        color: #aaa; // Šedý placeholder
    }
`;

const Button = styled.button`
    background-color: #4a90e2; // Tlačítko v modré barvě
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
        background-color: #357ab8; // Tmavší modrá při hoveru
    }
`;

const TagForm = styled.form`
    margin-top: 20px;
`;

const customStyles = {
    menu: (provided: any) => ({
        ...provided,
        marginTop: 0, // Odstranění marginu nahoře
        marginBottom: 0, // Odstranění marginu dole
        backgroundColor: '#2a2a2a', }),
    control: (provided: any) => ({
        ...provided,
        backgroundColor: '#2a2a2a', // Tmavší pozadí
        border: '1px solid #444',
        color: 'white',
        minHeight: '40px',
        boxShadow: 'none',
        '&:hover': {
            border: '1px solid #777',
        },
    }),
    option: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#444' : '#2a2a2a', // Pozadí při hoveru
        color: state.isSelected ? '#4a90e2' : 'white', // Barva textu při výběru
    }),
    multiValue: (provided: any) => ({
        ...provided,
        backgroundColor: '#4a90e2', // Pozadí pro vybrané tagy
    }),
    multiValueLabel: (provided: any) => ({
        ...provided,
        color: 'white',
    }),
    multiValueRemove: (provided: any) => ({
        ...provided,
        color: 'white',
        ':hover': {
            backgroundColor: 'red', // Barva při hoveru na odstranění tagu
            color: 'white',
        },
    }),
};

const AddForm = () => {
    const { state, dispatch } = useContext(QuoteContext);
    const { tags } = state; // Získání tagů z kontextu
    const [newQuote, setNewQuote] = useState('');
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]); // Stav pro výběr více tagů
    const [newTagName, setNewTagName] = useState(''); // Stav pro nový tag

    const generatedNumbers: number[] = [];

    const randomID = () => {
        let random;
        do {
            random = Math.floor(Math.random() * 100000000); // Generování čísla v rozsahu 0 až 100000000
        } while (generatedNumbers.includes(random)); // Kontrola, zda číslo již bylo vygenerováno
        generatedNumbers.push(random); // Uložení unikátního čísla
        return random; // Návrat unikátního čísla
    };

    const handleQuoteSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            console.log(state.userToken	)
            // Nejprve vytvoř citát
            const quoteResponse = await fetch(`${api_url}/Quotes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${state.userToken}`
                },
                body: JSON.stringify({ id: randomID(), text: newQuote }),
            });

            if (!quoteResponse.ok) {
                throw new Error('Failed to add quote');
            }

            const quoteData = await quoteResponse.json(); // Předpokládejme, že dostaneš ID nového citátu

            // Poté vytvoř QuoteTag pro každý vybraný tag
            for (const tag of selectedTags) {
                const quoteTagResponse = await fetch(`${api_url}/QuoteTags`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ quoteId: quoteData.id, tagId: tag.id }), // Odeslání quoteId a tagId
                });

                if (!quoteTagResponse.ok) {
                    throw new Error('Failed to add quote tag');
                }
            }

            // Po úspěšném přidání resetuj formulář
            setNewQuote('');
            setSelectedTags([]);
            fetchQuotes(); // Aktualizace citátů
            fetchQuoteTags(); // Aktualizace QuoteTagů
            fetchTags(); // Aktualizace tagů
        } catch (error) {
            console.error('Error adding quote or quote tag:', error);
        }
    };

    const handleTagSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            // Přidání nového tagu
            const tagResponse = await fetch(`${api_url}/Tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: randomID(), name: newTagName }), // Odeslání názvu nového tagu
            });

            if (!tagResponse.ok) {
                throw new Error('Failed to add tag');
            }

            setNewTagName('');
            fetchTags(); // Aktualizace tagů
        } catch (error) {
            console.error('Error adding tag:', error);
        }
    };

    const fetchQuotes = async () => {
        dispatch({ type: 'FETCH_QUOTES_REQUEST' }); // Zahájení načítání
        try {
            const response = await fetch(api_url + '/Quotes');
            if (!response.ok) {
                throw new Error('Failed to fetch quotes');
            }
            const data: Quote[] = await response.json();
            dispatch({ type: 'FETCH_QUOTES_SUCCESS', payload: data }); // Úspěšné načtení
        } catch (error) {
            dispatch({ type: 'FETCH_QUOTES_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' }); // Chyba
        }
    };

    const fetchQuoteTags = async () => {
        dispatch({ type: 'FETCH_QUOTETAGS_REQUEST' }); // Zahájení načítání
        try {
            const response = await fetch(api_url + '/QuoteTags');
            if (!response.ok) {
                throw new Error('Failed to fetch quoteTags');
            }
            const data: QuoteTag[] = await response.json();
            dispatch({ type: 'FETCH_QUOTETAGS_SUCCESS', payload: data }); // Úspěšné načtení
        } catch (error) {
            dispatch({ type: 'FETCH_QUOTETAGS_FAILURE', payload: error instanceof Error ? error.message : 'Unknown error' }); // Chyba
        }
    };

    const fetchTags = async () => {
        dispatch({ type: 'FETCH_TAGS_REQUEST' }); // Zahájení načítání
        try {
            const response = await fetch(`${api_url}/Tags`);
            if (!response.ok) {
                throw new Error('Failed to fetch tags');
            }
            const data: Tag[] = await response.json();
            dispatch({ type: 'FETCH_TAGS_SUCCESS', payload: data }); // Úspěšné načtení
        } catch (error) {
            dispatch({
                type: 'FETCH_TAGS_FAILURE',
                payload: error instanceof Error ? error.message : 'Unknown error',
            }); // Chyba
        }
    };

    const handleTagChange = (selectedOptions: any) => {
        setSelectedTags(selectedOptions || []); // Nastavíme vybrané tagy
    };

    return (
        <FormContainer>
            <form onSubmit={handleQuoteSubmit}>
                <Input
                    type="text"
                    value={newQuote}
                    onChange={(e) => setNewQuote(e.target.value)}
                    required
                    placeholder="Enter your quote"
                />

                {/* Multi-select s výběrem tagů */}
                <Select
                    isMulti
                    options={tags.map((tag) => ({ value: tag.id, label: tag.name }))}
                    value={selectedTags.map((tag) => ({ value: tag.id, label: tag.name }))}
                    onChange={(selected) => handleTagChange(selected.map((option: any) => ({ id: option.value, name: option.label })))}
                    placeholder="Select tags for the quote"
                    styles={customStyles} // Použití stylů pro select
                />

                <Button type="submit">Add Quote</Button>
            </form>

            <TagForm onSubmit={handleTagSubmit}>
                <Input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    required
                    placeholder="Enter new tag name"
                />
                <Button type="submit">Add Tag</Button>
            </TagForm>
        </FormContainer>
    );
};

export default AddForm;
