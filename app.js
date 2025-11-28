console.log('🚀 Pure JavaScript app starting...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM loaded');
    
    const root = document.getElementById('root');
    
    if (root) {
        root.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%);
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                color: white;
                font-family: system-ui, -apple-system, sans-serif;
            ">
                <div style="text-align: center; max-width: 600px; padding: 40px;">
                    <h1 style="font-size: 64px; color: #00ff88; margin-bottom: 30px;">🎯 Network Iris</h1>
                    <div style="font-size: 32px; margin-bottom: 40px; color: #ffffff;">
                        ✅ JavaScript is Working!
                    </div>
                    <div style="
                        background: rgba(255,255,255,0.1);
                        backdrop-filter: blur(10px);
                        border-radius: 15px;
                        padding: 30px;
                        border: 1px solid rgba(255,255,255,0.2);
                    ">
                        <p style="font-size: 20px; margin-bottom: 15px;">
                            🎨 Pure HTML + JavaScript Test
                        </p>
                        <p style="font-size: 16px; color: #aaa; margin-bottom: 10px;">
                            Time: ${new Date().toLocaleString()}
                        </p>
                        <p style="font-size: 14px; color: #888;">
                            Click anywhere to change background
                        </p>
                    </div>
                </div>
            </div>
        `;
        
        console.log('✅ Content rendered successfully!');
        
        // Add interactivity
        document.addEventListener('click', function() {
            const colors = [
                'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                'linear-gradient(45deg, #f093fb 0%, #f5576c 100%)',
                'linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)',
                'linear-gradient(45deg, #43e97b 0%, #38f9d7 100%)'
            ];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            root.querySelector('div').style.background = randomColor;
            console.log('🎨 Background changed!');
        });
        
    } else {
        console.error('❌ Root element not found!');
        document.body.innerHTML = `
            <div style="
                width: 100vw;
                height: 100vh;
                background: #ff0000;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
            ">ERROR: Root element not found!</div>
        `;
    }
});