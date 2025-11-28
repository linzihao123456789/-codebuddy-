// 直接操作 DOM，不使用 React
console.log('🚀 Direct DOM test starting...');

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔍 DOM loaded');
  
  const root = document.getElementById('root');
  console.log('📍 Root element:', root);
  
  if (root) {
    root.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, #1a1a1a, #2a2a2a);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-family: system-ui;
    `;
    
    root.innerHTML = `
      <h1 style="font-size: 72px; color: #00ff00; margin-bottom: 20px;">🎯 NETWORK IRIS</h1>
      <p style="font-size: 32px; color: #ffffff;">✅ Direct DOM Working!</p>
      <div style="
        margin-top: 40px;
        padding: 30px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
        text-align: center;
      ">
        <p>Current time: ${new Date().toLocaleString()}</p>
        <p style="margin-top: 10px;">If you see this, JavaScript and DOM are working!</p>
      </div>
    `;
    
    console.log('✅ DOM content added successfully!');
  } else {
    console.error('❌ Root element not found!');
    document.body.style.cssText = `
      margin: 0;
      padding: 0;
      background: #ff0000;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-size: 48px;
    `;
    document.body.textContent = 'ERROR: Root element not found!';
  }
});