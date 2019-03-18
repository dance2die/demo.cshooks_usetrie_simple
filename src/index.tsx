import * as React from "react";
import { render } from "react-dom";

import useTrie, { Trie } from "@cshooks/usetrie";

import "./styles.css";

const log = console.log;

function reducer(state, action) {
  switch (action.type) {
    case "SET_WORD":
      return { ...state, word: action.word };
    case "ADD_WORD":
      return { ...state, words: [...state.words, action.word] };
    case "REMOVE_WORD":
      const removed = state.words.filter(word => word !== action.word);
      log(`removed`, removed);
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
  const [state, dispatch] = React.useReducer(reducer, {
    words: initialWords,
    trie
  });

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
      state.trie.add(state.word);
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

  return (
    <React.Fragment>
      <header>
        <h1>Case Insensitive search</h1>
      </header>
      <section>
        <form onSubmit={addWord}>
          <input
            placeholder="Enter new word"
            onChange={setWord}
            value={state.word}
          />
          <button type="submit">Add</button>
        </form>
      </section>
      <section>
        <h2>Available for search</h2>
        <ul>{AvailableWords}</ul>
      </section>
      <section>
        <article>
          <div>
            <input
              placeholder="Enter Search Term"
              type="text"
              value={state.term}
              onChange={checkIfTermExists}
            />
          </div>
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
        <article>
          The term "{state.term}"{" "}
          {trie.has(state.term, state.isExact) ? "exists" : "does not exist!"}
        </article>
        <article>
          <h2>Possible Matches</h2>
          <ul>{getMatches()}</ul>
        </article>{" "}
      </section>
    </React.Fragment>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
