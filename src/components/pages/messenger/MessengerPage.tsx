import styles from './styles.module.css';
import ChatList from '@/components/complex/chat-list/ChatList';
import ChatThread from '@/components/complex/chat-thread/ChatThread';
import NewChatDialog from '@/components/complex/new-chat-dialog/NewChatDialog';
import type {ChatListItemModel} from '@/types/ChatListItemModel';
import type {Chat} from '@/types/Chat';

import {BUTTON_TYPES} from '@/constants/button';

type MessengerPageProps = {
  items: ChatListItemModel[];
  activeChat: Chat | null;
  instanceId: string;
  pollError: string | null;
  notice: string | null;
  isNewChatOpen: boolean;
  newChatPhone: string;
  newChatError: string | null;
  isCreatingChat: boolean;
  onLogout: () => void;
  onSelectChat: (chatId: string) => void;
  onBack: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onRetry: (localId: string) => void;
  onOpenNewChat: () => void;
  onCloseNewChat: () => void;
  onNewChatPhoneChange: (value: string) => void;
  onCreateChat: () => void;
  onRetryPolling: () => void;
};

export default function MessengerPage(props: MessengerPageProps) {
  const {
    items,
    activeChat,
    instanceId,
    pollError,
    notice,
    isNewChatOpen,
    newChatPhone,
    newChatError,
    isCreatingChat,
    onLogout,
    onSelectChat,
    onBack,
    onDraftChange,
    onSend,
    onRetry,
    onOpenNewChat,
    onCloseNewChat,
    onNewChatPhoneChange,
    onCreateChat,
    onRetryPolling,
  } = props;
  const {id: activeChatId = null} = activeChat ?? {};
  const hasActiveChat = activeChat !== null;
  const isPollErrorVisible = pollError !== null;
  const isNoticeVisible = notice !== null;

  return (
    <main className={styles.shell} data-has-chat={hasActiveChat}>
      <div className={styles.sidebar}>
        <ChatList
          items={items}
          activeChatId={activeChatId}
          instanceId={instanceId}
          onSelect={onSelectChat}
          onCreate={onOpenNewChat}
          onLogout={onLogout}
        />
      </div>

      <div className={styles.thread}>
        {isPollErrorVisible && (
          <div className={styles.banner} role="status" data-test-id="poll-error">
            <span>{pollError}</span>
            <button type={BUTTON_TYPES.BUTTON} onClick={onRetryPolling}>
              Повторить
            </button>
          </div>
        )}

        {isNoticeVisible && (
          <div className={styles.banner} role="alert" data-test-id="messenger-notice">
            <span>{notice}</span>
          </div>
        )}

        <ChatThread chat={activeChat} onBack={onBack} onDraftChange={onDraftChange} onSend={onSend} onRetry={onRetry} />
      </div>

      {isNewChatOpen && (
        <NewChatDialog
          phone={newChatPhone}
          error={newChatError}
          isSubmitting={isCreatingChat}
          onPhoneChange={onNewChatPhoneChange}
          onSubmit={onCreateChat}
          onClose={onCloseNewChat}
        />
      )}
    </main>
  );
}
