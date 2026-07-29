import React, { useEffect, useState } from 'react';
import './Keyboard.css';

interface KeyProps {
  main: string;
  tr?: string;
  bc?: string;
  w?: number;
  purple?: boolean;
  isLogo?: boolean;
  smallMain?: boolean;
  id?: string;
  isActive?: boolean;
}

const Key: React.FC<KeyProps> = ({ main, tr, bc, w = 44, purple = false, isLogo = false, smallMain = false, isActive = false }) => {
  if (isLogo) {
    return (
      <div className="key-logo">
        <span>~</span>
      </div>
    );
  }

  const isCentered = !tr && !bc;

  return (
    <div
      className={`key ${purple ? 'key-purple' : 'key-dark'} ${isActive ? 'active' : ''}`}
      style={{ width: `${w}px`, height: '44px' }}
    >
      {isCentered ? (
        <div className="flex h-full w-full items-center justify-center">
          <span className={`${smallMain ? 'text-[10px]' : 'text-[13px]'} font-bold tracking-wide`}>{main}</span>
        </div>
      ) : (
        <>
          <span className={`absolute top-1.5 left-2 ${smallMain ? 'text-[10px]' : 'text-[14px]'} font-bold leading-none`}>{main}</span>
          {tr && (
            <span className="absolute top-1 right-2 text-[11px] font-medium opacity-80 leading-none">
              {tr}
            </span>
          )}
          {bc && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] font-medium opacity-70 leading-none">
              {bc}
            </span>
          )}
        </>
      )}
    </div>
  );
};

const Keyboard: React.FC = () => {
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [capsLock, setCapsLock] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setCapsLock(e.getModifierState('CapsLock'));
      }
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.getModifierState) {
        setCapsLock(e.getModifierState('CapsLock'));
      }
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const isKeyActive = (k: any) => {
    if (k.id && activeKeys.has(k.id)) return true;
    
    // Check by mapping event.code to main text
    const codeMap: Record<string, string> = {
      Escape: 'Esc',
      Tab: 'Tab',
      CapsLock: 'Caps',
      Enter: 'Enter',
      Delete: 'Del',
      PageUp: 'PgUp',
      PageDown: 'PgDn',
      Minus: '-',
      Equal: '=',
      BracketLeft: '[',
      BracketRight: ']',
      Backslash: '\\',
      Semicolon: ';',
      Quote: "'",
      Comma: ',',
      Period: '.',
      Slash: '/',
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→'
    };

    for (const code of Array.from(activeKeys)) {
      if (k.id && code === k.id) return true;
      if (code.startsWith('Key') && code.replace('Key', '') === k.main) return true;
      if (code.startsWith('Digit') && code.replace('Digit', '') === k.main) return true;
      if (codeMap[code] === k.main && k.id === undefined) return true;
    }
    return false;
  };

  const row1 = [
    { main: 'Esc', purple: true, id: 'Escape' },
    { main: '1', tr: '!', bc: 'F1' },
    { main: '2', tr: '@', bc: 'F2' },
    { main: '3', tr: '#', bc: 'F3' },
    { main: '4', tr: '$', bc: 'F4' },
    { main: '5', tr: '%', bc: 'F5' },
    { main: '6', tr: '^', bc: 'F6' },
    { main: '7', tr: '&', bc: 'F7' },
    { main: '8', tr: '*', bc: 'F8' },
    { main: '9', tr: '(', bc: 'F9' },
    { main: '0', tr: ')', bc: 'F10' },
    { main: '-', tr: '_', bc: 'F11' },
    { main: '=', tr: '+', bc: 'F12' },
    { main: '←', bc: 'Home', w: 92, purple: true, id: 'Backspace' },
    { main: '', isLogo: true, id: 'Backquote' },
  ];

  const row2 = [
    { main: 'Tab', w: 68, purple: true },
    { main: 'Q' },
    { main: 'W' },
    { main: 'E' },
    { main: 'R' },
    { main: 'T' },
    { main: 'Y' },
    { main: 'U', bc: 'PrtSc' },
    { main: 'I', bc: 'ScrLk' },
    { main: 'O', bc: 'Pause' },
    { main: 'P' },
    { main: '[', tr: '{' },
    { main: ']', tr: '}' },
    { main: '\\', tr: '|', w: 68 },
    { main: 'Del', purple: true, w: 80 },
  ];

  const row3 = [
    { main: 'Caps', w: 80, purple: true },
    { main: 'A', bc: 'Mac' },
    { main: 'S', bc: 'Win' },
    { main: 'D' },
    { main: 'F' },
    { main: 'G' },
    { main: 'H', bc: '☀' },
    { main: 'J', bc: '☀' },
    { main: 'K' },
    { main: 'L' },
    { main: ';', tr: ':' },
    { main: '\'', tr: '"' },
    { main: 'Enter', w: 122, purple: true },
    { main: 'PgDn', purple: true, smallMain: true, w: 62 },
  ];

  const row4 = [
    { main: 'Shift', w: 116, purple: true, id: 'ShiftLeft' },
    { main: 'Z' },
    { main: 'X' },
    { main: 'C' },
    { main: 'V', bc: '⏯' },
    { main: 'B', bc: '⏮' },
    { main: 'N', bc: '⏭' },
    { main: 'M' },
    { main: ',', tr: '<', bc: '🔉' },
    { main: '.', tr: '>', bc: '🔊' },
    { main: '/', tr: '?', bc: '🔇' },
    { main: 'Shift', w: 92, purple: true, id: 'ShiftRight' },
    { main: '↑', bc: '☀' },
    { main: 'PgUp', bc: 'End', purple: true, smallMain: true, w: 56 },
  ];

  const row5 = [
    { main: 'Ctrl', bc: 'Control', w: 56, purple: true, id: 'ControlLeft' },
    { main: 'Win', bc: 'Option', w: 56, purple: true, id: 'MetaLeft' },
    { main: 'Alt', bc: 'Command', w: 56, purple: true, id: 'AltLeft' },
    { main: '', w: 310, id: 'Space' },
    { main: 'Alt', bc: 'Command', w: 56, purple: true, id: 'AltRight' },
    { main: 'Fn', w: 44, purple: true },
    { main: 'Ctrl', w: 56, purple: true, id: 'ControlRight' },
    { main: '←', bc: '☀' },
    { main: '↓', bc: '☀' },
    { main: '→' },
  ];

  return (
    <div className="keyboard-wrapper">
      <div className="keyboard-case">
        <div className="led-container">
          <div className="led"></div>
          <div className={`led ${capsLock ? 'green' : ''}`}></div>
          <div className="led"></div>
        </div>
        <div className="keyboard-inner">
          <div className="key-row">
            {row1.map((k, i) => (
              <Key key={`r1-${i}`} {...k} isActive={isKeyActive(k)} />
            ))}
          </div>
          <div className="key-row">
            {row2.map((k, i) => (
              <Key key={`r2-${i}`} {...k} isActive={isKeyActive(k)} />
            ))}
          </div>
          <div className="key-row">
            {row3.map((k, i) => (
              <Key key={`r3-${i}`} {...k} isActive={isKeyActive(k)} />
            ))}
          </div>
          <div className="key-row">
            {row4.map((k, i) => (
              <Key key={`r4-${i}`} {...k} isActive={isKeyActive(k)} />
            ))}
          </div>
          <div className="key-row">
            {row5.map((k, i) => (
              <Key key={`r5-${i}`} {...k} isActive={isKeyActive(k)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Keyboard;
