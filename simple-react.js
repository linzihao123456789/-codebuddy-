// Simple React without JSX
console.log('🚀 Simple React loading...');

const e = React.createElement;

function App() {
    console.log('🎨 App component rendering');
    return e('div', {
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontFamily: 'system-ui'
        }
    }, [
        e('div', {
            style: { textAlign: 'center', maxWidth: '600px', padding: '40px' }
        }, [
            e('h1', {
                style: { fontSize: '64px', color: '#00ff88', marginBottom: '20px' }
            }, '🎯 Network Iris'),
            e('p', {
                style: { fontSize: '28px', marginBottom: '30px' }
            }, '✅ Simple React Working!'),
            e('div', {
                style: {
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    padding: '30px'
                }
            }, [
                e('p', { style: { fontSize: '18px' } }, '🎨 React + No JSX Test'),
                e('p', { style: { fontSize: '16px', color: '#aaa', marginTop: '10px' } }, 'Time: ' + new Date().toLocaleString())
            ])
        ])
    ]);
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 DOM loaded, mounting React...');
    
    const root = document.getElementById('root');
    
    if (root) {
        console.log('🏗️ Creating React root...');
        const reactRoot = ReactDOM.createRoot(root);
        
        console.log('🎨 Rendering React component...');
        reactRoot.render(e(App));
        
        console.log('✅ React app mounted successfully!');
    } else {
        console.error('❌ Root element not found');
    }
});