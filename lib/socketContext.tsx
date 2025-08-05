'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import io, { Socket } from 'socket.io-client';

interface OnlineUser {
  id: string;
  username: string;
  image: string | null;
  city: string | null;
  socketId: string;
  followersCount: number;
  connectedAt?: string;
}

interface SocketContextType {
  onlineUsers: OnlineUser[];
  error: string | null;
  socket: Socket | null;
  isConnected: boolean;
  notifications: any[];
  addNotification: (notification: any) => void;
}

const SocketContext = createContext<SocketContextType>({
  onlineUsers: [],
  error: null,
  socket: null,
  isConnected: false,
  notifications: [],
  addNotification: () => {},
});

// Função para detectar ambiente
const detectEnvironment = () => {
  if (typeof window === 'undefined') {
    return false; // Server-side, assume produção
  }

  // Verificar se há uma configuração forçada no localStorage
  const forceLocal = localStorage.getItem('force-socket-local');
  if (forceLocal === 'true') {
    console.log('🔧 Forçando conexão local via localStorage');
    return true;
  }

  const hostname = window.location.hostname;
  const port = window.location.port;
  const href = window.location.href;

  console.log('🔍 Debug - Detecção de ambiente:');
  console.log('  Hostname:', hostname);
  console.log('  Port:', port);
  console.log('  URL completa:', href);

  // Verificar variáveis de ambiente do Next.js
  const nextEnv = process.env.NODE_ENV;
  console.log('  NODE_ENV:', nextEnv);

  // Verificar se é desenvolvimento baseado em múltiplos critérios
  const isDevelopment = 
    // Por hostname
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '192.168.3.16' ||
    hostname.includes('192.168.') ||
    hostname.includes('10.0.') ||
    hostname.includes('172.') ||
    // Por porta
    port === '3000' ||
    // Por URL
    href.includes('localhost') ||
    href.includes('192.168.') ||
    href.includes('127.0.0.1') ||
    // Por variável de ambiente
    nextEnv === 'development';

  console.log('🔍 Ambiente detectado:', isDevelopment ? 'DESENVOLVIMENTO' : 'PRODUÇÃO');
  
  return isDevelopment;
};

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const addNotification = (notification: any) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Manter apenas as 10 últimas
  };

  useEffect(() => {
    // Detectar ambiente
    const isDevelopment = detectEnvironment();

    const socketUrl = isDevelopment 
      ? 'http://192.168.3.16:4000'
      : 'https://socket.confissoesdecorno.com:4000';

    console.log('🔌 Conectando ao socket:', socketUrl);

    // Inicializar conexão com o socket
    const socketIo = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    setSocket(socketIo);

    // Eventos de conexão
    socketIo.on('connect', () => {
      console.log('✅ Conectado ao servidor socket');
      setIsConnected(true);
      setIsAuthenticated(false); // Reset autenticação ao reconectar
      setError(null); // Limpa qualquer erro antigo ao conectar
    });

    socketIo.on('disconnect', () => {
      console.log('🔌 Desconectado do servidor socket');
      setIsConnected(false);
      // Só mostra erro se não estiver logado
      if (!session?.user?.id) {
        setError('Você precisa estar logado para se conectar ao WebSocket.');
      } else {
        setError(null);
      }
    });

    // Escutar atualizações de usuários conectados
    socketIo.on('update_connected_users', (users: OnlineUser[]) => {
      console.log('📊 Usuários online atualizados:', users.length);
      console.log('📋 Lista de usuários recebida:', users);
      console.log('🔍 Estrutura dos dados recebidos:', users.map(u => ({
        id: u.id,
        username: u.username,
        idType: typeof u.id,
        idLength: u.id?.length,
        hasImage: !!u.image,
        hasCity: !!u.city
      })));
      setOnlineUsers(users);
    });

    // Escutar notificações em tempo real
    socketIo.on('notification', (notification: any) => {
      console.log('🔔 Notificação recebida via socket:', notification);
      console.log('🔔 Tipo da notificação:', notification.type);
      console.log('🔔 Dados da notificação:', notification);
      addNotification(notification);
      console.log('✅ Notificação adicionada ao contexto');
    });

    // Escutar confirmação de autenticação
    socketIo.on('authenticated', (data: { success: boolean; userId: string }) => {
      console.log('🔐 Confirmação de autenticação recebida:', data);
      if (data.success) {
        setIsAuthenticated(true);
        console.log('✅ Usuário autenticado com sucesso:', data.userId);
      }
    });

    // Lidar com erros
    socketIo.on('error', (data: { message: string }) => {
      console.error('❌ Erro do socket:', data.message);
      setError(data.message);
    });

    // Lidar com reconexão
    socketIo.on('reconnect', () => {
      console.log('🔄 Reconectado ao servidor socket');
      setIsConnected(true);
      setIsAuthenticated(false); // Reset autenticação ao reconectar
      setError(null);
      
      // Reautenticar após reconexão
      if (session?.user?.id) {
        console.log('🔐 Reautenticando usuário:', session.user.id);
        socketIo.emit('authenticate', { userId: session.user.id });
      }
    });

    // Lidar com falha de reconexão
    socketIo.on('reconnect_error', (error) => {
      console.error('❌ Erro na reconexão:', error);
      setError('Falha na reconexão com o servidor. Tentando novamente...');
    });

    // Lidar com erro de conexão
    socketIo.on('connect_error', (error) => {
      console.error('❌ Erro de conexão:', error);
      console.error('❌ Detalhes do erro:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      setError('Erro ao conectar com o servidor de tempo real.');
      setIsConnected(false);
    });

    // Adicionar listener para tentativas de reconexão
    socketIo.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Tentativa de reconexão #${attemptNumber}`);
    });

    // Adicionar listener para quando a reconexão falha
    socketIo.on('reconnect_failed', () => {
      console.error('❌ Todas as tentativas de reconexão falharam');
      setError('Falha na conexão com o servidor de tempo real após múltiplas tentativas.');
    });

    // Limpar ao desmontar o componente
    return () => {
      console.log('🔌 Desconectando socket');
      socketIo.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, []); // Executa apenas uma vez ao montar o componente

  // Autenticar quando a sessão estiver disponível
  useEffect(() => {
    console.log('🔍 Verificando autenticação:', {
      status,
      hasSocket: !!socket,
      isConnected,
      hasSession: !!session,
      userId: session?.user?.id
    });

    if (status === 'loading' || !socket || !isConnected) {
      console.log('⏳ Aguardando condições para autenticação...');
      return;
    }

    if (status === 'unauthenticated') {
      setError('Você precisa estar logado para se conectar ao WebSocket.');
      return;
    }

    const userId = session?.user?.id;
    if (userId && !isAuthenticated) {
      console.log('🔐 Autenticando usuário:', userId);
      console.log('🔐 Dados da sessão:', {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email
      });
      console.log('🔐 Enviando evento authenticate...');
      socket.emit('authenticate', { userId });
      console.log('🔐 Evento authenticate enviado');
      setIsAuthenticated(true);
    } else if (userId && isAuthenticated) {
      console.log('🔐 Usuário já autenticado:', userId);
    } else {
      console.log('❌ Não foi possível obter ID do usuário da sessão');
      console.log('🔍 Status da sessão:', status);
      console.log('🔍 Dados da sessão:', session);
      setError('Erro ao obter ID do usuário.');
    }
  }, [session?.user?.id, status, socket, isConnected, isAuthenticated]); // Mudança: usar session?.user?.id em vez de session

  // Enviar pings periódicos para manter o usuário online
  useEffect(() => {
    if (!session?.user?.id || !isConnected) return;

    const pingInterval = setInterval(async () => {
      try {
        await fetch('/api/users/ping', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } catch (error) {
        console.error('Erro ao enviar ping:', error);
      }
    }, 30000); // Ping a cada 30 segundos

    return () => clearInterval(pingInterval);
  }, [session?.user?.id, isConnected]);

  return (
    <SocketContext.Provider value={{ onlineUsers, error, socket, isConnected, notifications, addNotification }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}