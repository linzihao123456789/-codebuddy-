console.log('🚀 JavaScript loaded');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (rootElement) {
  rootElement.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: white;
      font-family: system-ui;
    ">
      <h1 style="font-size: 48px; margin-bottom: 20px;">🎯 Network Iris</h1>
      <p style="font-size: 20px;">✅ JavaScript is working!</p>
      <div style="
        margin-top: 30px;
        padding: 20px;
        background: rgba(255,255,255,0.1);
        border-radius: 8px;
        backdrop-filter: blur(10px);
      ">
        <p>Current time: ${new Date().toLocaleString()}</p>
        <p>User Agent: ${navigator.userAgent.substring(0, 50)}...</p>
      </div>
    </div>
  `;
  
  console.log('✅ Content rendered successfully');
} else {
  console.error('❌ Root element not found');
}

console.log('🎉 Script execution complete');