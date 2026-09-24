import { Component, OnDestroy } from '@angular/core';

interface ChatItem {
  title: string;
  time: string;
  active?: boolean;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

interface ModelOption {
  name: string;
  description: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {

  screen: 'landing' | 'login' | 'workspace' = 'landing';

  sidebarOpen = false;
  modelOpen = false;
  isTyping = false;
  connected = false;

  chatSearch = '';
  messageText = '';

  email = '';
  password = '';

  currentTitle = 'New conversation';

  private socket: WebSocket | null = null;

  selectedModel: ModelOption = {
    name: 'Elyra Pro',
    description: 'Balanced reasoning & speed'
  };

  models: ModelOption[] = [
    {
      name: 'Elyra Pro',
      description: 'Balanced reasoning & speed'
    },
    {
      name: 'Elyra Fast',
      description: 'Fast everyday responses'
    },
    {
      name: 'Elyra Code',
      description: 'Optimized for development'
    }
  ];

  chats: ChatItem[] = [
    {
      title: 'Build a React landing page',
      time: '12 min ago'
    },
    {
      title: 'Fix authentication error',
      time: '1 hour ago'
    },
    {
      title: 'Portfolio project ideas',
      time: 'Today'
    },
    {
      title: 'Explain REST APIs',
      time: 'Yesterday'
    },
    {
      title: 'Improve dashboard UI',
      time: 'Yesterday'
    },
    {
      title: 'Python automation script',
      time: '2 days ago'
    }
  ];

  messages: ChatMessage[] = [];

  starterPrompts = [
    {
      icon: '⌘',
      title: 'Build something',
      description: 'Create a complete web experience',
      text: 'Help me build a modern responsive website.'
    },
    {
      icon: '</>',
      title: 'Write code',
      description: 'Generate or improve your code',
      text: 'Write a clean JavaScript function for me.'
    },
    {
      icon: '◈',
      title: 'Debug',
      description: 'Find and explain coding issues',
      text: 'Help me debug a coding problem.'
    },
    {
      icon: '✦',
      title: 'Brainstorm',
      description: 'Turn an idea into a plan',
      text: 'Help me brainstorm a new software project.'
    }
  ];

  constructor() {
    this.connectToBackend();
  }

  get filteredChats(): ChatItem[] {
    const search = this.chatSearch.toLowerCase().trim();

    if (!search) {
      return this.chats;
    }

    return this.chats.filter(chat =>
      chat.title.toLowerCase().includes(search)
    );
  }

  goToLogin(): void {
    this.screen = 'login';
  }

  goToLanding(): void {
    this.screen = 'landing';
  }

  enterWorkspace(): void {
    this.screen = 'workspace';
  }

  demoEnter(): void {
    this.email = 'demo@elyra.app';
    this.password = 'demo';
    this.enterWorkspace();
  }

  connectToBackend(): void {
    try {
     this.socket = new WebSocket('wss://mahamrao.pythonanywhere.com/ws/chat');

      this.socket.onopen = () => {
        this.connected = true;
      };

      this.socket.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'system') {
            return;
          }

          if (data.type === 'assistant') {
            this.messages.push({
              role: 'assistant',
              content: data.message || 'Elyra returned an empty response.',
              time: this.formatTime(new Date())
            });

            this.isTyping = false;
          }

        } catch (error) {
          console.error('Invalid server response:', error);
          this.isTyping = false;
        }
      };

      this.socket.onerror = () => {
        this.connected = false;
        this.isTyping = false;
      };

      this.socket.onclose = () => {
        this.connected = false;
      };

    } catch (error) {
      console.error(error);
    }
  }

  reconnect(): void {
    if (this.socket) {
      this.socket.close();
    }

    this.connectToBackend();
  }

  newChat(): void {
    this.messages = [];
    this.messageText = '';
    this.currentTitle = 'New conversation';

    this.chats.forEach(chat => {
      chat.active = false;
    });

    this.sidebarOpen = false;
  }

  selectChat(chat: ChatItem): void {
    this.chats.forEach(item => {
      item.active = false;
    });

    chat.active = true;
    this.currentTitle = chat.title;

    this.messages = [
      {
        role: 'user',
        content: 'Can you help me continue this project?',
        time: '10:42 PM'
      },
      {
        role: 'assistant',
        content:
          'Absolutely. Tell me what you want to build or change and we can work through it together.',
        time: '10:42 PM'
      }
    ];

    this.sidebarOpen = false;
  }

  selectModel(model: ModelOption): void {
    this.selectedModel = model;
    this.modelOpen = false;
  }

  useStarterPrompt(prompt: string): void {
    this.messageText = prompt;
    this.sendMessage();
  }

  handleKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      (event.metaKey || event.ctrlKey)
    ) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage(): void {
    const text = this.messageText.trim();

    if (!text || this.isTyping) {
      return;
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messages.push({
        role: 'assistant',
        content:
          'Elyra is currently offline. Start the FastAPI server on port 8000 and try again.',
        time: this.formatTime(new Date())
      });

      this.reconnect();
      return;
    }

    this.messages.push({
      role: 'user',
      content: text,
      time: this.formatTime(new Date())
    });

    if (this.currentTitle === 'New conversation') {
      this.currentTitle = this.createTitle(text);

      this.chats.unshift({
        title: this.currentTitle,
        time: 'Just now',
        active: true
      });
    }

    this.messageText = '';
    this.isTyping = true;

    this.socket.send(text);
  }

  createTitle(text: string): string {
    const words = text.split(' ');

    if (words.length <= 5) {
      return text;
    }

    return words.slice(0, 5).join(' ') + '...';
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  copyText(text: string): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
  }

  signIn(event: Event): void {
    event.preventDefault();

    if (!this.email.trim() || !this.password.trim()) {
      return;
    }

    this.enterWorkspace();
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.close();
    }
  }
}
