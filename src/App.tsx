import React, { useEffect, useRef } from 'react';

function App() {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure the element exists before trying to get computed styles
    const element = elementRef.current;
    if (!element) return;

    // Now it's safe to get computed styles
    const styles = window.getComputedStyle(element);
    // Use the computed styles here...
  }, []); // Empty dependency array means this runs once after mount

  return (
    <div ref={elementRef} className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p>Start prompting (or editing) to see magic happen :)</p>
    </div>
  );
}

export default App;