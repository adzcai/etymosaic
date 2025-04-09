import { Component } from 'solid-js';
import EtymologyLookup from './components/EtymologyLookup';

const App: Component = () => {
  return (
    <>
      <header>
        <h1>Word Etymology Lookup</h1>
      </header>
      <main>
        <EtymologyLookup />
      </main>
    </>
  );
};

export default App;
