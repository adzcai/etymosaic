import { Component, Show, For } from 'solid-js';

interface EtymologyTextProps {
  text: string;
}

interface Token {
  type: string;
  content: string;
  href?: string;
}

const EtymologyText: Component<EtymologyTextProps> = (props) => {
  const parseTokens = (text: string): Token[] => {
    const tokens: Token[] = [];
    let currentIndex = 0;
    const tokenRegex = /\{([^}]+)\}(.*?)\{\/\1\}/g;
    let match: RegExpExecArray | null;

    while ((match = tokenRegex.exec(text)) !== null) {
      // Add text before the token
      if (match.index > currentIndex) {
        tokens.push({
          type: 'text',
          content: text.slice(currentIndex, match.index)
        });
      }

      // Parse the token content for hyperlink information
      const tokenType = match[1];
      let tokenContent = match[2];
      let href: string | undefined;

      // Check if this is a cross-reference token with hyperlink
      if (['a_link', 'd_link', 'dxt', 'et_link', 'i_link', 'mat', 'sx'].includes(tokenType)) {
        const linkMatch = tokenContent.match(/^([^|]+)\|(.+)$/);
        if (linkMatch) {
          href = linkMatch[1];
          tokenContent = linkMatch[2];
        }
      }

      // Add the token
      tokens.push({
        type: tokenType,
        content: tokenContent,
        ...(href && { href })
      });

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      tokens.push({
        type: 'text',
        content: text.slice(currentIndex)
      });
    }

    return tokens;
  };

  const renderToken = (token: Token) => {
    // Formatting and Punctuation Tokens
    switch (token.type) {
      case 'b':
        return <strong>{token.content}</strong>;
      case 'bc':
        return <strong>{token.content}</strong>;
      case 'inf':
        return <sub>{token.content}</sub>;
      case 'it':
        return <em>{token.content}</em>;
      case 'ldquo':
        return '&ldquo;';
      case 'p_br':
        return <br />;
      case 'rdquo':
        return '&rdquo;';
      case 'sc':
        return <span style={{ 'font-variant': 'small-caps' }}>{token.content}</span>;
      case 'sup':
        return <sup>{token.content}</sup>;
    }

    // Word-Marking and Gloss Tokens
    switch (token.type) {
      case 'gloss':
        return <em>{token.content}</em>;
      case 'parahw':
        return <strong>{token.content}</strong>;
      case 'phrase':
        return <strong>{token.content}</strong>;
      case 'qword':
        return <em>{token.content}</em>;
      case 'wi':
        return <em>{token.content}</em>;
    }

    // Cross-Reference Grouping Tokens
    switch (token.type) {
      case 'dx':
        return <span>{token.content}</span>;
      case 'dx_def':
        return <span>{token.content}</span>;
      case 'dx_ety':
        return <span>{token.content}</span>;
      case 'ma':
        return <span>{token.content}</span>;
    }

    // Cross-Reference Tokens
    switch (token.type) {
      case 'a_link':
        return <a href={token.href || `#`}>{token.content}</a>;
      case 'd_link':
        return <a href={token.href || `#`}>{token.content}</a>;
      case 'dxt':
        return <a href={token.href || `#`}>{token.content}</a>;
      case 'et_link':
        return <a href={token.href || `#`}>{token.content}</a>;
      case 'i_link':
        return <a href={token.href || `#`}>{token.content}</a>;
      case 'mat':
        return <a href={token.href || `#`}>{token.content}</a>;
      case 'sx':
        return <a href={token.href || `#`}>{token.content}</a>;
    }

    // Date Sense Token
    if (token.type === 'ds') {
      return <em>{token.content}</em>;
    }

    // Default case for text and unknown tokens
    return token.content;
  };

  return (
    <Show when={props.text}>
      <div>
        <For each={parseTokens(props.text)}>
          {(token) => renderToken(token)}
        </For>
      </div>
    </Show>
  );
};

export default EtymologyText; 