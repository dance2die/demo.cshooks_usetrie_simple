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
  const words = [
    "abcd", "abce", "ABC", "THE", "their",
    "there", "hel", "hell", "hello", "help",
    "helping", "helps"
  ];
  const isCaseSensitive = false;
  const trie = useTrie(words, isCaseSensitive);
  const [state, dispatch] = React.useReducer(reducer, { words, trie });

  const checkIfTermExists = e =>
    dispatch({ type: "SET_TERM", term: e.target.value });
  const getAvailableWords = React.useCallback(
    () => words.map(word => <li key={word}>{word}</li>),
    [words]
  );

  const setWord = React.useCallback(
    e => {
      const word = e.target.value;
      console.log(`setting word="${word}"`);
      dispatch({ type: "SET_WORD", word });
    },
    [state.word]
  );

  const addWord = React.useCallback(
    e => {
      e.preventDefault();

      console.log(`adding word="${state.word}"`);
      state.trie.add(state.word);
      dispatch({ type: "ADD_WORD", word: state.word });
    },
    [state.word]
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
        <h2>Following words are available for search</h2>
        <ul>{getAvailableWords()}</ul>
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
          <ul>
            {trie.search(state.term).map(word => (
              <li key={word}>{word}</li>
            ))}
          </ul>
        </article>{" "}
      </section>
    </React.Fragment>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
