// Script para limpar localStorage e cache
console.log('🧹 Limpando localStorage e cache...');

// Limpar impersonation
localStorage.removeItem('impersonation');

// Limpar outros dados que possam estar causando problemas
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.includes('supabase') || key.includes('impersonation'))) {
        keysToRemove.push(key);
    }
}

keysToRemove.forEach(key => {
    console.log('Removendo:', key);
    localStorage.removeItem(key);
});

console.log('✅ localStorage limpo!');
console.log('🔄 Recarregue a página com Ctrl+Shift+R (ou Cmd+Shift+R no Mac)');
