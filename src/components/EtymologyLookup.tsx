import { createSignal, For, Show } from 'solid-js';
import styles from './EtymologyLookup.module.css';
import EtymologyText from './EtymologyText';
import { lancasterStemmer } from 'lancaster-stemmer';

// Contraction expansion map
const contractions: Record<string, string> = {
  "can't": "cannot",
  "won't": "will not",
  "don't": "do not",
  "doesn't": "does not",
  "didn't": "did not",
  "isn't": "is not",
  "aren't": "are not",
  "wasn't": "was not",
  "weren't": "were not",
  "haven't": "have not",
  "hasn't": "has not",
  "hadn't": "had not",
  "wouldn't": "would not",
  "shouldn't": "should not",
  "couldn't": "could not",
  "mightn't": "might not",
  "mustn't": "must not",
  "shan't": "shall not",
  "needn't": "need not",
  "daren't": "dare not",
  "oughtn't": "ought not",
  "ain't": "am not", // Note: "ain't" is informal
  "let's": "let us",
  "that's": "that is",
  "he's": "he is",
  "she's": "she is",
  "it's": "it is",
  "what's": "what is",
  "who's": "who is",
  "where's": "where is",
  "when's": "when is",
  "why's": "why is",
  "how's": "how is",
  "there's": "there is",
  "here's": "here is",
  "I'm": "I am",
  "you're": "you are",
  "we're": "we are",
  "they're": "they are",
  "I've": "I have",
  "you've": "you have",
  "we've": "we have",
  "they've": "they have",
  "I'd": "I would",
  "you'd": "you would",
  "he'd": "he would",
  "she'd": "she would",
  "it'd": "it would",
  "we'd": "we would",
  "they'd": "they would",
  "I'll": "I will",
  "you'll": "you will",
  "he'll": "he will",
  "she'll": "she will",
  "it'll": "it will",
  "we'll": "we will",
  "they'll": "they will"
};

type EtymologyResult = {
  word: string;
  etymology: string;
  expandedForm?: string;
  error?: never;
} | {
  word: string;
  etymology?: never;
  expandedForm?: never;
  error: string;
}

interface MerriamWebsterResponse {
  meta: {
    id: string;
    uuid: string;
    sort: string;
    src: string;
    section: string;
    stems: string[];
    offensive: boolean;
  };
  hwi: {
    hw: string;
    prs?: Array<{
      mw: string;
      sound: {
        audio: string;
      };
    }>;
  };
  fl: string;
  def: Array<{
    sseq: Array<Array<Array<any>>>;
  }>;
  et: Array<Array<string>>;
  date: string;
  shortdef: string[];
}

export default function EtymologyLookup() {
  const [text, setText] = createSignal('');
  const [results, setResults] = createSignal<EtymologyResult[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');
  const [showTable, setShowTable] = createSignal(false);

  async function lookupEtymology(word: string): Promise<EtymologyResult> {
    try {
      // First try the word as is
      let response = await fetch(
        `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(word)}?key=${import.meta.env.VITE_MERRIAM_WEBSTER_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch etymology for ${word}`);
      }

      let data = await response.json() as MerriamWebsterResponse[];

      // If no etymology found and it's a contraction, try the expanded form
      if ((!data.length || !data[0].et) && contractions[word]) {
        const expandedForm = contractions[word];
        response = await fetch(
          `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${encodeURIComponent(expandedForm)}?key=${import.meta.env.VITE_MERRIAM_WEBSTER_API_KEY}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch etymology for ${expandedForm}`);
        }

        data = await response.json() as MerriamWebsterResponse[];
        
        if (data.length > 0 && data[0].et) {
          const etymology = data[0].et
            .flat()
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim();

          return {
            word,
            etymology,
            expandedForm
          };
        }
      }

      if (data.length > 0 && data[0].et) {
        const etymology = data[0].et
          .flat()
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();

        return {
          word,
          etymology
        };
      }

      return {
        word,
        error: 'No etymology found'
      };
    } catch (err) {
      return {
        word,
        error: err instanceof Error ? err.message : 'Unknown error occurred'
      };
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const words = text()
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 0);

    const newResults: EtymologyResult[] = [];

    for (const word of words) {
      const result = await lookupEtymology(word);
      newResults.push(result);
    }

    setResults(newResults);
    setLoading(false);
  };

  function generateTableText(): string {
    const rows = results().map(result => {
      const word = result.word;
      const stem = lancasterStemmer(word);
      const expandedForm = 'expandedForm' in result ? result.expandedForm : '';
      const etymology = 'etymology' in result ? result.etymology : '';
      const error = 'error' in result ? result.error : '';

      return `| ${word} | ${stem} | ${expandedForm} | ${etymology || error} |`;
    });

    const header = '| Word | Stem | Expanded Form | Etymology |\n|------|------|---------------|-----------|';
    return `${header}\n${rows.join('\n')}`;
  }

  function copyToClipboard() {
    const tableText = generateTableText();
    navigator.clipboard.writeText(tableText).then(() => {
      // You could add a visual feedback here if needed
    }).catch(err => {
      setError('Failed to copy to clipboard');
    });
  }

  return (
    <div class={styles.container}>
      <form onSubmit={handleSubmit} class={styles.form}>
        <textarea
          value={text()}
          onInput={(e) => setText(e.currentTarget.value)}
          placeholder="Enter words to look up their etymologies..."
          class={styles.textarea}
        />
        <div class={styles.buttonGroup}>
          <button type="submit" disabled={loading()} class={styles.button}>
            {loading() ? 'Looking up...' : 'Look up etymologies'}
          </button>
          <Show when={results().length > 0}>
            <button 
              type="button" 
              onClick={copyToClipboard} 
              class={styles.copyButton}
              title="Copy results as markdown table"
            >
              Copy Table
            </button>
          </Show>
        </div>
      </form>

      <Show when={error()}>
        <div class={styles.error}>{error()}</div>
      </Show>

      <div class={styles.results}>
        <For each={results()}>
          {(result) => (
            <div class={styles.result}>
              <h3>{result.word}</h3>
              <p class={styles.stem}>Stem: {lancasterStemmer(result.word)}</p>
              <Show when={'expandedForm' in result && result.expandedForm}>
                <p class={styles.expanded}>Expanded form: {result.expandedForm}</p>
              </Show>
              <Show when={'error' in result} fallback={
                <EtymologyText text={result.etymology!} />
              }>
                <p class={styles.error}>{result.error}</p>
              </Show>
            </div>
          )}
        </For>
      </div>
    </div>
  );
} 