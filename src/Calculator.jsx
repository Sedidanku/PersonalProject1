import React, { useEffect, useState } from "react";
import "./Calculator.css";

export default function Calculator() {
  const [curr, setCurr] = useState("0");
  const [prev, setPrev] = useState("");
  const [op, setOp] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const maxDigits = 12;

  const clampDisplay = (n) => {
    if (!isFinite(n)) return "∞";
    const abs = Math.abs(n);
    if (abs !== 0 && (abs >= 1e12 || abs < 1e-6))
      return n.toExponential(6).replace(/\+?0*(\d+)/, "$1");
    let s = n.toFixed(10);
    s = s.replace(/\.0+$/, "").replace(/(\.[0-9]*?)0+$/, "$1");
    const [intPart, decPart] = s.split(".");
    const intFmt = Number(intPart).toLocaleString();
    return decPart ? `${intFmt}.${decPart}` : intFmt;
  };

  const operate = (a, b, op) => {
    const A = Number(a), B = Number(b);
    switch (op) {
      case "+": return +(A + B).toPrecision(15);
      case "-": return +(A - B).toPrecision(15);
      case "*": return +(A * B).toPrecision(15);
      case "/": return B === 0 ? Infinity : +(A / B).toPrecision(15);
      default: return B;
    }
  };

  const appendDigit = (d) => {
    if (justEvaluated) {
      setCurr(d === "." ? "0." : d);
      setJustEvaluated(false);
      return;
    }
    if (d === ".") {
      if (!curr.includes(".")) setCurr(curr + ".");
      return;
    }
    if (curr === "0") setCurr(d);
    else if (curr.replace(/\D/g, "").length < maxDigits) setCurr(curr + d);
  };

  const chooseOp = (nextOp) => {
    if (op && !justEvaluated) {
      const res = operate(prev || 0, curr, op);
      setPrev(String(res));
      setCurr("0");
    } else {
      setPrev(curr);
      setCurr("0");
    }
    setOp(nextOp);
    setJustEvaluated(false);
  };

  const clearAll = () => { setCurr("0"); setPrev(""); setOp(null); setJustEvaluated(false); };
  const delOne = () => {
    if (justEvaluated) { setCurr("0"); setJustEvaluated(false); }
    else if (curr.length > 1) setCurr(curr.slice(0, -1));
    else setCurr("0");
  };
  const negate = () => setCurr(String(-Number(curr)));
  const percent = () => setCurr(String(Number(curr) / 100));
  const equals = () => {
    if (!op) return;
    const res = operate(prev || 0, curr, op);
    setCurr(String(res));
    setPrev(""); setOp(null); setJustEvaluated(true);
  };

  // Keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      const { key } = e;
      if (/^[0-9]$/.test(key)) appendDigit(key);
      else if (key === ".") appendDigit(".");
      else if (["+", "-", "*", "/"].includes(key)) chooseOp(key);
      else if (key === "Enter" || key === "=") { e.preventDefault(); equals(); }
      else if (key === "Backspace") delOne();
      else if (key === "Escape") clearAll();
      else if (key.toLowerCase() === "n") negate();
      else if (key === "%") percent();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // Theme toggle with localStorage (applies to <body>)
  const LS_KEY = "calc-theme";
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "light") document.body.classList.add("light");
  }, []);
  const toggleTheme = () => {
    const isLight = document.body.classList.toggle("light");
    localStorage.setItem(LS_KEY, isLight ? "light" : "dark");
  };

  return (
    <div className="calc">
      <div className="header">
        <div className="title">Calculator</div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          Toggle theme
        </button>
      </div>

      <div className="display" aria-live="polite" aria-atomic="true">
        <div className="prev">{prev && op ? `${clampDisplay(Number(prev))} ${op}` : ""}</div>
        <div className="curr">{clampDisplay(Number(curr))}</div>
      </div>

      <div className="keys">
        <button className="key ac" onClick={clearAll}>AC</button>
        <button className="key del" onClick={delOne}>DEL</button>
        <button className="key util" onClick={percent}>%</button>
        <button className="key op" onClick={() => chooseOp("/")}>÷</button>

        {[7,8,9].map(n => <button key={n} className="key" onClick={() => appendDigit(String(n))}>{n}</button>)}
        <button className="key op" onClick={() => chooseOp("*")}>×</button>

        {[4,5,6].map(n => <button key={n} className="key" onClick={() => appendDigit(String(n))}>{n}</button>)}
        <button className="key op" onClick={() => chooseOp("-")}>−</button>

        {[1,2,3].map(n => <button key={n} className="key" onClick={() => appendDigit(String(n))}>{n}</button>)}
        <button className="key op" onClick={() => chooseOp("+")}>+</button>

        <button className="key util" onClick={negate}>±</button>
        <button className="key" onClick={() => appendDigit("0")}>0</button>
        <button className="key" onClick={() => appendDigit(".")}>.</button>
        <button className="key equals" onClick={equals}>=</button>
      </div>
    </div>
  );
}
