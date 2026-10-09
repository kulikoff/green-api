import styles from './styles.module.css';
import ArrowLeftIcon from '@/icons/arrow-left.svg?react';
import SendIcon from '@/icons/send.svg?react';
import {MESSAGE_DIRECTIONS, MESSAGE_STATUSES} from '@/constants/chat';
import {MAX_TEXT_MESSAGE_LENGTH} from '@/constants/greenApi';
import {formatChatTime, formatPhone, generateChatTitle} from '@/utils/common';
import type {Chat} from '@/types/Chat';
import {VALUE_RETURN} from 'keycode-js';
import type {ChangeEvent, KeyboardEvent, SubmitEvent} from 'react';
import {useEffect, useRef} from 'react';

import {BUTTON_TYPES} from '@/constants/button';

type ChatThreadProps = {
  chat: Chat | null;
  onBack: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  onRetry: (localId: string) => void;
};

export default function ChatThread(props: ChatThreadProps) {
  const {chat, onBack, onDraftChange, onSend, onRetry} = props;
  const bottomRef = useRef<HTMLDivElement>(null);
  const {id: chatId, draft = '', messages = []} = chat ?? {};
  const messageCount = messages.length;
  const trimmedLength = draft.trim().length;
  const isTooLong = trimmedLength > MAX_TEXT_MESSAGE_LENGTH;
  const canSend = trimmedLength > 0 && !isTooLong;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({block: 'end'});
  }, [chatId, messageCount]);

  const handleSend = () => {
    if (canSend) {
      onSend();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const {key, shiftKey} = event;
    const isSendShortcut = key === VALUE_RETURN && !shiftKey;

    if (isSendShortcut) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const {value} = event.target;
    onDraftChange(value);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSend();
  };

  if (!chat) {
    return (
      <section className={styles.emptyPane}>
        <div>
          <h1>Выберите чат</h1>
          <p>Или создайте новый по номеру телефона получателя.</p>
        </div>
      </section>
    );
  }

  const {contactName, phone} = chat;
  const title = generateChatTitle(chat);
  const subtitle = contactName ? formatPhone(phone) : 'личный чат';
  const isMessageListEmpty = messageCount === 0;

  const messageList = messages.map((message) => {
    const {localId, direction, text, createdAt, status} = message;
    const isOutgoing = direction === MESSAGE_DIRECTIONS.OUTGOING;
    const isSending = status === MESSAGE_STATUSES.SENDING;
    const isFailed = status === MESSAGE_STATUSES.FAILED;
    const className = isOutgoing ? styles.outgoing : styles.incoming;
    const dataTestId = `message-${localId}`;
    const createdAtIso = new Date(createdAt).toISOString();
    const timeLabel = formatChatTime(createdAt);

    const handleRetry = () => onRetry(localId);

    return (
      <div key={localId} className={className} data-test-id={dataTestId} data-direction={direction}>
        <div className={styles.bubble}>
          <p>{text}</p>
          <time dateTime={createdAtIso}>{timeLabel}</time>
        </div>

        {isSending && <span className={styles.status}>Отправка…</span>}

        {isFailed && (
          <button type={BUTTON_TYPES.BUTTON} className={styles.retry} onClick={handleRetry}>
            Не отправлено. Повторить
          </button>
        )}
      </div>
    );
  });

  return (
    <section className={styles.thread} data-test-id="chat-thread">
      <header className={styles.header}>
        <button
          type={BUTTON_TYPES.BUTTON}
          className={styles.back}
          onClick={onBack}
          aria-label="К списку чатов"
          data-test-id="chat-back"
        >
          <ArrowLeftIcon width={22} height={22} aria-hidden="true" />
        </button>

        <div className={styles.heading}>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </header>

      <div className={styles.messages}>
        {isMessageListEmpty && <p className={styles.placeholder}>Напишите сообщение — оно уйдёт в MAX.</p>}
        {messageList}
        <div ref={bottomRef} />
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <label className={styles.composerLabel} htmlFor="message">
          Сообщение
        </label>

        <textarea
          id="message"
          className={styles.input}
          value={draft}
          rows={1}
          placeholder="Сообщение"
          data-test-id="message-input"
          onChange={handleDraftChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type={BUTTON_TYPES.SUBMIT}
          className={styles.send}
          disabled={!canSend}
          aria-label="Отправить"
          data-test-id="message-submit"
        >
          <SendIcon width={20} height={20} aria-hidden="true" />
        </button>

        {isTooLong && (
          <p className={styles.limit} data-test-id="message-limit">
            {trimmedLength}/{MAX_TEXT_MESSAGE_LENGTH}
          </p>
        )}
      </form>
    </section>
  );
}
