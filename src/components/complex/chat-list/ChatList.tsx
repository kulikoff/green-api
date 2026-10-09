import styles from './styles.module.css';
import MaxLogoIcon from '@/icons/max-logo.svg?react';
import type {ChatListItemModel} from '@/types/ChatListItemModel';
import {BUTTON_TYPES} from '@/constants/button';

type ChatListProps = {
  items: ChatListItemModel[];
  activeChatId: string | null;
  instanceId: string;
  onSelect: (chatId: string) => void;
  onCreate: () => void;
  onLogout: () => void;
};

export default function ChatList(props: ChatListProps) {
  const {items, activeChatId, instanceId, onSelect, onCreate, onLogout} = props;
  const {length: itemCount} = items;
  const isChatListEmpty = itemCount === 0;
  const instanceLabel = `Инстанс ${instanceId}`;

  const chatListItems = items.map((item) => {
    const {id, title, preview, timeLabel} = item;
    const isActive = id === activeChatId;
    const className = isActive ? styles.itemActive : styles.item;
    const testId = `chat-${id}`;

    const handleSelect = () => onSelect(id);

    return (
      <button key={id} type={BUTTON_TYPES.BUTTON} className={className} onClick={handleSelect} data-test-id={testId}>
        <span className={styles.meta}>
          <span className={styles.row}>
            <span className={styles.title}>{title}</span>
            <time className={styles.time}>{timeLabel}</time>
          </span>

          <span className={styles.preview}>{preview}</span>
        </span>
      </button>
    );
  });

  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <MaxLogoIcon width={18} height={18} />
          </span>

          <span>MAX</span>
        </div>

        <button type={BUTTON_TYPES.BUTTON} className={styles.logout} onClick={onLogout} data-test-id="logout">
          Выйти
        </button>
      </header>

      <button type={BUTTON_TYPES.BUTTON} className={styles.create} onClick={onCreate} data-test-id="new-chat-open">
        <span className={styles.plus} aria-hidden="true">
          +
        </span>
        Новый чат
      </button>

      <div className={styles.list} data-test-id="chat-list">
        {isChatListEmpty && <p className={styles.empty}>Пока нет чатов. Укажите номер и начните переписку.</p>}
        {chatListItems}
      </div>

      <footer className={styles.footer}>{instanceLabel}</footer>
    </aside>
  );
}
