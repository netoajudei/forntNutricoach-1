#!/bin/bash

# Script para configurar o MCP do Supabase no Claude Desktop
# Autor: Antigravity AI

echo "🚀 Configurando MCP do Supabase..."

CONFIG_DIR="$HOME/Library/Application Support/Claude"
CONFIG_FILE="$CONFIG_DIR/claude_desktop_config.json"

# Criar diretório se não existir
mkdir -p "$CONFIG_DIR"

# Fazer backup se o arquivo existir
if [ -f "$CONFIG_FILE" ]; then
    BACKUP_FILE="$CONFIG_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    echo "📦 Fazendo backup: $BACKUP_FILE"
    cp "$CONFIG_FILE" "$BACKUP_FILE"
fi

# Criar/atualizar configuração
cat > "$CONFIG_FILE" << 'EOF'
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "https://hiufaonhsxlnoozwbygq.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpdWZhb25oc3hsbm9vendieWdxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDAyNzkzMCwiZXhwIjoyMDc1NjAzOTMwfQ.lKTvWw0U9tOAsv0IEqoRa3EFA7HBjxH7xzPYa1K757E"
      ]
    }
  }
}
EOF

echo "✅ Configuração criada com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Feche completamente o Claude Desktop"
echo "2. Abra o Claude Desktop novamente"
echo "3. A conexão com o Supabase estará disponível!"
echo ""
echo "💡 Dica: Se você já tinha outras configurações MCP, elas foram substituídas."
echo "   Você pode restaurar o backup em: $BACKUP_FILE"
