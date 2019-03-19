import * as React from "react";
import { render } from "react-dom";

import useTrie, { Trie } from "@cshooks/usetrie";
import styled, { createGlobalStyle } from "styled-components";
// import { Reset } from "styled-reset";

import "./styles.css";

const log = console.log;

const Container = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentContainer = styled.section`
  display: grid;
  grid-gap: 55px;
  grid: 1fr / 2fr 3fr;
  margin-top: 2rem;
`;

const AvailableWordsContainer = styled.section`
  justify-content: center;
`;

function reducer(state, action) {
  switch (action.type) {
    case "SET_WORD":
      return { ...state, word: action.word };
    case "ADD_WORD":
      if (state.words.includes(action.word)) return state;

      // Mutating the trie returns a new instance
      state.trie.add(action.word);
      return { ...state, words: [...state.words, action.word] };
    case "REMOVE_WORD":
      const removed = state.words.filter(word => word !== action.word);
      // Mutating the trie returns a new instance
      state.trie.remove(action.word);
      return { ...state, words: [...removed] };
    case "SET_TERM":
      return { ...state, term: action.term };
    case "SET_ISEXACT": {
      return { ...state, isExact: action.isExact };
    }
    default:
      return state;
  }
}

function App() {
  // prettier-ignore
  const initialWords = [
    "abcd", "abce", "ABC", "THE", "their",
    "there", "hel", "hell", "hello", "help",
    "helping", "helps"
  ];
  const isCaseSensitive = false;
  const trie = useTrie(initialWords, isCaseSensitive);

  const initialState = {
    words: initialWords,
    word: "",
    term: "",
    isExact: true,
    trie
  };
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const checkIfTermExists = e =>
    dispatch({ type: "SET_TERM", term: e.target.value });

  const removeWord = React.useCallback(
    (word: string) => {
      log(`removing "${word}"`);
      trie.remove(word);
      dispatch({ type: "REMOVE_WORD", word });
    },
    [trie]
  );

  const AvailableWords = React.useMemo(
    () =>
      state.words.map(word => {
        return (
          <li key={word}>
            <button key={word} onClick={() => removeWord(word)}>
              ❌
            </button>{" "}
            {word}
          </li>
        );
      }),
    [state.words]
  );

  const setWord = React.useCallback(
    e => dispatch({ type: "SET_WORD", word: e.target.value }),
    [state.word]
  );

  const addWord = React.useCallback(
    e => {
      e.preventDefault();

      dispatch({ type: "ADD_WORD", word: state.word });
    },
    [state.word]
  );

  const getMatches = React.useCallback(
    () => {
      return trie.search(state.term).map(word => <li key={word}>{word}</li>);
    },
    [trie]
  );

  const getExistStatus = React.useCallback(
    () => {
      const { trie, term, isExact } = state;
      return (
        <pre>
          The term "{term}"
          {trie.has(term, isExact) ? " exists" : " does not exist!"}
        </pre>
      );
    },
    [state.term, state.isExact]
  );

  return (
    <Container>
      <header>
        <h1>Case Insensitive search</h1>
      </header>
      <section>
        <form onSubmit={addWord}>
          <input
            placeholder="Add a new word"
            onChange={setWord}
            value={state.word}
          />
          <button type="submit">Add</button>
        </form>
      </section>
      <ContentContainer>
        <AvailableWordsContainer>
          <h2>Available for search</h2>
          <ol>{AvailableWords}</ol>
        </AvailableWordsContainer>
        <section>
          <article>
            <input
              placeholder="Search"
              type="text"
              value={state.term}
              onChange={checkIfTermExists}
            />{" "}
            <label>
              Exact match?
              <input
                type="checkbox"
                checked={state.isExact}
                onChange={e =>
                  dispatch({ type: "SET_ISEXACT", isExact: e.target.checked })
                }
              />
            </label>
          </article>
          <article>{getExistStatus()}</article>
          <article>
            <h2>Possible Matches</h2>
            <ol>{getMatches()}</ol>
          </article>{" "}
        </section>
      </ContentContainer>
    </Container>
  );
}

const GlobalStyle = createGlobalStyle({
  boxSizing: "border-box"
});

const rootElement = document.getElementById("root");
render(
  <React.Fragment>
    <GlobalStyle />
    <App />
  </React.Fragment>,
  rootElement
);
