import { Board, Card, Column } from '@/types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export interface AIAction {
  type:
    | 'create_card'
    | 'move_card'
    | 'delete_card'
    | 'update_card'
    | 'create_column'
    | 'update_column'
    | 'delete_column'
    | 'board_summary'
    | 'ask_clarification'
    | 'error';
  data?: {
    title?: string;
    description?: string;
    columnId?: string;
    columnName?: string;
    newColumnName?: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    cardId?: string;
    cards?: Array<{ title: string; description?: string; priority?: string }>;
    question?: string;
    summary?: string;
    message?: string;
  };
}

export interface AIResponse {
  message: string;
  actions: AIAction[];
}

function buildSystemPrompt(board: Board): string {
  const columns = board.columns.map((col) => ({
    id: col.id,
    name: col.title,
    cardCount: col.cardIds.length,
  }));

  const cards = Object.values(board.cards).map((card) => ({
    id: card.id,
    title: card.title,
    column: board.columns.find((c) => c.id === card.columnId)?.title,
    priority: card.priority,
  }));

  return `You are an AI assistant for a Kanban board application called "Tactical Ops Kanban".
You help users manage their tasks through natural language commands in Portuguese or English.

CURRENT BOARD STATE:
- Board: "${board.title}"
- Columns: ${JSON.stringify(columns)}
- Cards: ${JSON.stringify(cards.slice(0, 20))} ${cards.length > 20 ? `... and ${cards.length - 20} more` : ''}

AVAILABLE ACTIONS:
1. create_card - Create a new card/task (needs: title, columnId or columnName, optional: description, priority)
2. move_card - Move a card to another column (needs: cardId, columnId or columnName)
3. delete_card - Delete a card (needs: cardId)
4. update_card - Update card details (needs: cardId, optional: title, description, priority)
5. create_column - Create a new column/sector (needs: title) - IMPORTANT: use "title" field for column name
6. update_column - Rename a column (needs: columnId or columnName, newColumnName)
7. delete_column - Delete a column (needs: columnId or columnName) - WARNING: this deletes all cards in it!
8. board_summary - Provide a summary of the board
9. ask_clarification - Ask for more information if needed

RESPONSE FORMAT:
Always respond with valid JSON in this exact format:
{
  "message": "Your friendly response to the user (in their language)",
  "actions": [
    {
      "type": "action_type",
      "data": { ... action specific data ... }
    }
  ]
}

RULES:
1. Respond in the SAME LANGUAGE the user used (Portuguese or English)
2. If information is missing (like column or priority), use ask_clarification action
3. For create_card: title (required), description (optional), columnId or columnName (required), priority (optional, default: medium)
4. For create_column: title (required) - ALWAYS use "title" field, NOT "columnName" or "name"
5. Match column names flexibly: "TODO", "todo", "To Do", "a fazer" should all match the TODO column
6. Be helpful and conversational
7. If creating multiple cards, use the cards array in data

EXAMPLES:

User: "Cria uma task para corrigir o bug de login na coluna TODO"
Response: {"message": "✅ Card criado com sucesso!", "actions": [{"type": "create_card", "data": {"title": "Corrigir bug de login", "columnName": "TODO", "priority": "medium"}}]}

User: "Create a high priority task to fix the navbar"
Response: {"message": "✅ Card created successfully!", "actions": [{"type": "create_card", "data": {"title": "Fix the navbar", "columnName": "TODO", "priority": "high"}}]}

User: "Create a new column called Testing"
Response: {"message": "✅ Column created successfully!", "actions": [{"type": "create_column", "data": {"title": "Testing"}}]}

User: "Cria uma coluna chamada Em Revisão"
Response: {"message": "✅ Coluna criada com sucesso!", "actions": [{"type": "create_column", "data": {"title": "Em Revisão"}}]}

User: "Adiciona uma tarefa"
Response: {"message": "Claro! Para criar a tarefa, preciso de algumas informações:\\n• Qual o título da tarefa?\\n• Em qual coluna? (${columns.map((c) => c.name).join(', ')})", "actions": [{"type": "ask_clarification", "data": {"question": "title_and_column"}}]}

User: "What's the status of my board?"
Response: {"message": "📊 **Board Summary**\\n...", "actions": [{"type": "board_summary", "data": {"summary": "..."}}]}`;
}

export async function sendAIMessage(
  userMessage: string,
  board: Board
): Promise<AIResponse> {
  const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!apiKey) {
    return {
      message: '❌ API key not configured. Please add NEXT_PUBLIC_GROQ_API_KEY to your .env.local file.',
      actions: [{ type: 'error', data: { message: 'API key missing' } }],
    };
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: buildSystemPrompt(board) },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return {
        message: `❌ Error communicating with AI: ${response.status}`,
        actions: [{ type: 'error', data: { message: errorText } }],
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        message: '❌ No response from AI',
        actions: [{ type: 'error', data: { message: 'Empty response' } }],
      };
    }

    // Parse JSON response
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          message: content,
          actions: [],
        };
      }

      const parsed = JSON.parse(jsonMatch[0]) as AIResponse;
      return parsed;
    } catch (parseError) {
      // If parsing fails, return the raw message
      return {
        message: content,
        actions: [],
      };
    }
  } catch (error) {
    console.error('AI Service error:', error);
    return {
      message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      actions: [{ type: 'error', data: { message: String(error) } }],
    };
  }
}

// Execute AI actions on the board
export function executeAIAction(
  action: AIAction,
  board: Board,
  boardActions: {
    addCard: (columnId: string, title: string, description: string) => void;
    updateCard: (cardId: string, updates: Partial<Card>) => void;
    deleteCard: (cardId: string) => void;
    moveCard: (cardId: string, targetColumnId: string, newPosition: number) => void;
    addColumn: (title: string) => void;
    updateColumn: (columnId: string, updates: Partial<Column>) => void;
    deleteColumn: (columnId: string) => void;
  }
): boolean {
  try {
    switch (action.type) {
      case 'create_card': {
        const { title, description, columnId, columnName, priority } = action.data || {};
        if (!title) return false;

        // Find column by ID or name
        let targetColumn = columnId
          ? board.columns.find((c) => c.id === columnId)
          : null;

        if (!targetColumn && columnName) {
          const normalizedName = columnName.toLowerCase().trim();
          targetColumn = board.columns.find((c) => {
            const colName = c.title.toLowerCase().trim();
            return (
              colName === normalizedName ||
              colName.includes(normalizedName) ||
              normalizedName.includes(colName)
            );
          });
        }

        // Default to first column if not found
        if (!targetColumn) {
          targetColumn = board.columns[0];
        }

        if (!targetColumn) return false;

        boardActions.addCard(targetColumn.id, title, description || '');

        // Update priority if specified
        if (priority) {
          // We need to find the newly created card and update its priority
          // This is a bit hacky, but we'll do it after the card is created
          setTimeout(() => {
            const newCard = Object.values(board.cards).find(
              (c) => c.title === title && c.columnId === targetColumn!.id
            );
            if (newCard) {
              boardActions.updateCard(newCard.id, { priority });
            }
          }, 100);
        }

        return true;
      }

      case 'create_column': {
        console.log('[AI] create_column action.data:', JSON.stringify(action.data));
        const { title, columnName, name, newColumnName } = action.data || {};
        // AI might return the column name in different fields
        const columnTitle = title || columnName || name || newColumnName;
        console.log('[AI] Creating column with title:', columnTitle);
        if (!columnTitle) {
          console.error('[AI] No title provided for create_column action. Data:', action.data);
          return false;
        }
        boardActions.addColumn(columnTitle);
        console.log('[AI] Column created successfully');
        return true;
      }

      case 'move_card': {
        const { cardId, columnId, columnName } = action.data || {};
        if (!cardId) return false;

        let targetColumn = columnId
          ? board.columns.find((c) => c.id === columnId)
          : null;

        if (!targetColumn && columnName) {
          const normalizedName = columnName.toLowerCase().trim();
          targetColumn = board.columns.find((c) =>
            c.title.toLowerCase().includes(normalizedName)
          );
        }

        if (!targetColumn) return false;

        boardActions.moveCard(cardId, targetColumn.id, targetColumn.cardIds.length);
        return true;
      }

      case 'delete_card': {
        const { cardId } = action.data || {};
        if (!cardId) return false;
        boardActions.deleteCard(cardId);
        return true;
      }

      case 'update_card': {
        const { cardId, title, description, priority } = action.data || {};
        if (!cardId) return false;

        const updates: Partial<Card> = {};
        if (title) updates.title = title;
        if (description) updates.description = description;
        if (priority) updates.priority = priority as Card['priority'];

        boardActions.updateCard(cardId, updates);
        return true;
      }

      case 'update_column': {
        const { columnId, columnName, newColumnName } = action.data || {};
        if (!newColumnName) return false;

        let targetColumn = columnId
          ? board.columns.find((c) => c.id === columnId)
          : null;

        if (!targetColumn && columnName) {
          const normalizedName = columnName.toLowerCase().trim();
          targetColumn = board.columns.find((c) =>
            c.title.toLowerCase().includes(normalizedName)
          );
        }

        if (!targetColumn) return false;

        boardActions.updateColumn(targetColumn.id, { title: newColumnName });
        return true;
      }

      case 'delete_column': {
        const { columnId, columnName } = action.data || {};

        let targetColumn = columnId
          ? board.columns.find((c) => c.id === columnId)
          : null;

        if (!targetColumn && columnName) {
          const normalizedName = columnName.toLowerCase().trim();
          targetColumn = board.columns.find((c) =>
            c.title.toLowerCase().includes(normalizedName)
          );
        }

        if (!targetColumn) return false;

        boardActions.deleteColumn(targetColumn.id);
        return true;
      }

      case 'board_summary':
      case 'ask_clarification':
        // These don't modify the board
        return true;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error executing AI action:', error);
    return false;
  }
}
