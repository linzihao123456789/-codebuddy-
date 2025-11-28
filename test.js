// Simple JavaScript test
console.log('JavaScript is running');

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded');
  
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        width: 100vw;
        height: 100vh;
        background-color: #050505;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: system-ui;
      ">
        <h1 style="color: #3b82f6; font-size: 48px; margin-bottom: 20px;">JavaScript Test</h1>
        <p style="font-size: 20px;">If you see this, JS is working!</p>
        <p style="margin-top: 20px; color: #666;">Current time: ${new Date().toLocaleString()}</p>
      </div>
    `;
    
    console.log('Content injected successfully');
  } else {
    console.error('Root element not found');
  }
});